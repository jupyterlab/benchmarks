/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import * as neatCSV from 'neat-csv';
import * as fs from 'fs';
import { formatChange, performanceChangeFromData } from './index';

const OUTPUT_FILE = process.env['BENCHMARK_OUTPUT'] || 'diff.csv';
const OLD_FILE = process.env['BENCHMARK_INPUT_OLD'] || 'old.csv';
const NEW_FILE = process.env['BENCHMARK_INPUT_NEW'] || 'new.csv';

const stream = fs.createWriteStream(OUTPUT_FILE);

function writeLine(line: string): Promise<void> {
  return new Promise(function(resolve, reject) {
    stream.write(line + '\n', error => (error ? reject(error) : resolve()));
  });
}

void main();

const MODE_LABEL = {
  open: 'opening a notebook',
  switch: 'switching to a notebook'
};
async function main() {
  console.log(`Writing output to ${OUTPUT_FILE}`);
  await writeLine('mode,browser,n,type,mean,confidenceInterval');

  for await (const {
    mode,
    browser,
    n,
    mean,
    type,
    confidenceInterval
  } of compare(OLD_FILE, NEW_FILE, 0.95)) {
    console.log(
      `In ${browser} ${
        MODE_LABEL[mode as keyof typeof MODE_LABEL]
      } with ${type} where n=${n} is ${formatChange({
        mean,
        confidenceInterval
      })} with 95% confidence.`
    );
    await writeLine(
      [mode, browser, n, type, mean, confidenceInterval].join(',')
    );
  }
}

type OutputRow = {
  mode: string;
  browser: string;
  type: string;
  n: number;
  mean: number;
  confidenceInterval: number;
};

async function* compare(
  oldCSVPath: string,
  newCSVPath: string,
  confidenceInterval: number = 0.95
): AsyncIterable<OutputRow> {
  const collected: {
    // turn key into string so we can lookup easily with it
    [key: string]: {
      mode: string;
      browser: string;
      type: string;
      n: number;
      times: { [VERSION in 'old' | 'new_']: number[] };
    };
  } = {};
  for (const { path, version } of [
    { path: oldCSVPath, version: 'old' as 'old' },
    { path: newCSVPath, version: 'new_' as 'new_' }
  ]) {
    console.log('Parsing data', { path, version });
    const text = await fs.promises.readFile(path);
    for (const { mode, browser, n, type, time } of await neatCSV(text)) {
      const key = `${mode}-${browser}-${n}-${type}`;
      // get key if we have it, otherwise create new
      const data =
        collected[key] ||
        (collected[key] = {
          mode,
          browser,
          n: parseInt(n),
          type,
          times: { old: [], new_: [] }
        });
      data.times[version].push(parseFloat(time));
    }
  }
  for (const {
    mode,
    browser,
    type,
    n,
    times: { old, new_ }
  } of Object.values(collected)) {
    if (old.length != new_.length) {
      console.warn('Skipping because different lengths between runs', {
        mode,
        browser,
        type,
        n
      });
      continue;
    }
    if (old.length <= 2) {
      console.warn('Skipping because not enough runs', {
        mode,
        browser,
        type,
        n
      });
      continue;
    }
    yield {
      mode,
      browser,
      type,
      n,
      ...performanceChangeFromData(old, new_, confidenceInterval)
    };
  }
}

