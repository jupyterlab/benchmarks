/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 * Runs a number of benchmarks and saves the results to the
 */
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as playwright from 'playwright';
import * as util from 'util';
import * as si from 'systeminformation';
import NotebookType from './notebookType';
import { CELLS_MULTIPLIER, CODE_CELL_RATIO } from './notebooks/manyCells';
import { MANY_OUTPUTS } from './notebooks/manyOutputs';
import { DIV_NUMBER } from './notebooks/longOutput';
import { TABLE_ROWS, TABLE_COLUMNS } from './notebooks/fixedDataTable';

const DATA_PATH = process.env['BENCHMARK_OUTPUT'] || 'out.csv';
const WAIT_BETWEEN_TESTS: number = 1000;
const browsersEnv = process.env.BROWSERS;
const BROWSERS: Array<'firefox' | 'chromium'> = browsersEnv
? JSON.parse(browsersEnv)
: ['firefox', 'chromium'];

// The maximum N
const MAX_N = Number(process.env['BENCHMARK_MAX_N'] || 100);
// The number of different n's to try out
const NUMBER_SAMPLES = Number(process.env['BENCHMARK_NUMBER_SAMPLES'] || 21);  // Default is 20
// How many times to switch between each notebook
const SWITCHES = Number(process.env['BENCHMARK_SWITCHES'] || 10);
// Max time to stop testing if mean of previous sample was > this
const MAX_TIME = Number(process.env['BENCHMARK_MAX_TIME'] || 5 * 1000);  // Default is 5 * 1000
// Selector timeout in milliseconds
const TIME_OUT = 5 * 60 * 1000;

const browserVersions: any = {};

const notebookEnv = process.env.BENCHMARK_NOTEBOOKS;
const NOTEBOOK_PACKAGES: Array<string> = notebookEnv
  ? JSON.parse(notebookEnv)
  : ['largePlotly', 'longOutput', 'manyPlotly', 'manyOutputs', 'errorOutputs'];

type OUTPUT_TYPE = {
  browser: typeof BROWSERS[number];
  time: number;
  type: string; 
  n: number;
  mode: 'switch' | 'open';
};

const stream = fs.createWriteStream(DATA_PATH);

function writeLine(line: string): Promise<void> {
  return new Promise(function(resolve, reject) {
    stream.write(line + '\n', error => (error ? reject(error) : resolve()));
  });
}
function writeOutput({
  mode,
  browser,
  n,
  type,
  time
}: OUTPUT_TYPE): Promise<void> {
  return writeLine(`${mode},${browser},${n},${type},${time}`);
}

(async () => {
  const notebooks: Array<NotebookType> = (
    await Promise.all(
      NOTEBOOK_PACKAGES.map(path => import('./notebooks/' + path))
    )
  ).map(pkg => pkg.default);
  await writeLine('mode,browser,n,type,time');
  await fs.promises.mkdir('notebooks', { recursive: true });

  for (const browserName of BROWSERS) {
    console.log(`browser=${browserName}`);
    /**
     * List of types that are now too big for this browser.
     */
    const tooLong = new Set<string>();
    const browser = await playwright[browserName].launch({ headless: false });
    // const browserVersion = await browser.version();
    const context = await browser.newContext();
    context.setDefaultTimeout(TIME_OUT);
    const page = await context.newPage();
    await page.setViewportSize({
      width: 1280,
      height: 960
    });
    /*
    page.on('console', (msg: playwright.ConsoleMessage) => {
      console.log(`browser type=${msg.type()} text=${msg.text()}`);
    });
    */
    /**
     * Wait for a widget to be visible.
     */
    async function waitForNotebook(id: string): Promise<void> {
      await page.waitForSelector(`#${id}`, {
        state: "visible"
      });
      await page.waitForSelector(`#${id} .jp-Notebook-cell`, {
        state: "visible"
      });
      await page.waitForSelector(`#${id} .jp-Spinner`, {
        state: "hidden"
      });
    }

    function startTime(): Promise<void> {
      return page.evaluate(`{
        performance.clearMeasures();
        performance.mark('start');
      }`);
    }

    async function endTime(): Promise<number> {
      await page.evaluate("performance.measure('duration', 'start')");
      const time: number = await page.evaluate(
        'performance.getEntriesByName("duration")[0].duration'
      );
      return time;
    }

    const waitForLaunch = () =>
      page.waitForSelector('.jp-Launcher', { state: "visible" });
    // Go to reset for a new workspace
    await page.goto('http://localhost:9999/lab?reset');

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
    await page.waitForLoadState();

    await waitForLaunch();

    for (let n = 0; n <= MAX_N; n += MAX_N / (NUMBER_SAMPLES - 1)) {
      // stop testing if we don't have atleast two tests to keep running
      if (notebooks.length - tooLong.size < 2) {
        break;
      }
      console.log(` n=${n}/${MAX_N}`);
      // Open each notebook type we have for this n of samples
      // mapping from type to created id
      const widgets: Array<{ type: string; id: string }> = [];

      console.log(`  opening`);

      let totalTimes = new Map<string, number>();
      function checkTimes() {
        for (const [type, totalTime] of totalTimes.entries()) {
          const meanTime = totalTime / SWITCHES;
          if (meanTime > MAX_TIME) {
            console.log(`  stopped test type=${type}`);
            tooLong.add(type);
          }
        }
        totalTimes = new Map<string, number>();
      }

      for (const { notebook, waitFor, label } of notebooks) {
        if (tooLong.has(label)) {
          continue;
        }
        // Open each notebook SWITCHES times
        console.log(`   type=${label}`);
        const path = `notebooks/${label.replace('{N}', n.toString())}.ipynb`;

        await fs.promises.writeFile(
          path,
          JSON.stringify(notebook(n), null, ' '),
          { flag: 'w' }
        );
        await util.promisify(child_process.exec)(`jupyter trust "${path}"`);
        await page.evaluate('jupyterlab.restored');

        let id: string;
        for (let i = 0; i < SWITCHES; i++) {
          console.log(`    i=${i}/${SWITCHES - 1}`);
          await page.evaluate(
            'window.currentWidget ? window.currentWidget.dispose() : null'
          );
          await startTime();
          id = await page.evaluate(`
            jupyterlab.commands.execute('docmanager:open', {
              path: ${JSON.stringify(`${path}`)}
            }).then(widget => {
              window.currentWidget = widget;
              return widget.node.id;
            })
          `);
          await waitForNotebook(id);
          await waitFor({ widgetID: id, page });
          const time = await endTime();
          // Wait some time to reduce variance
          await page.waitForTimeout(WAIT_BETWEEN_TESTS);
          console.log(`     time=${time}`);
          await writeOutput({
            mode: 'open',
            browser: browserName,
            type: label,
            n,
            time
          });
          totalTimes.set(label, (totalTimes.get(label) || 0) + time);
        }
        widgets.push({ type: label, id: id! });
        await page.evaluate('window.currentWidget = undefined');
      }
      checkTimes();
      console.log(`  switching`);

      // Then switch between them repeatedly
      for (let i = 0; i < SWITCHES; i++) {
        console.log(`   i=${i}/${SWITCHES - 1}`);
        for (const { type, id } of widgets) {
          console.log(`    type=${type}`);
          await startTime();
          // mark before we activate, then wait for the widget to display, then get duration
          await page.evaluate(`{
            jupyterlab.shell.activateById(${JSON.stringify(id)});
          }`);
          await waitForNotebook(id);
          await notebooks
            .find(n => n.label === type)!
            .waitFor({
              widgetID: id,
              page
            });
          const time = await endTime();
          // Wait some time to reduce variance
          await page.waitForTimeout(WAIT_BETWEEN_TESTS);
          console.log(`     time=${time}`);
          totalTimes.set(type, (totalTimes.get(type) || 0) + time);
          await writeOutput({
            mode: 'switch',
            browser: browserName,
            type,
            n,
            time
          });
        }
      }
      checkTimes();
      console.log(`  cleaning`);

      // dipose directly instead of using `jupyterlab.shell.closeAll()` so that
      // no dialogues will pop up if notebooks are dirty
      await page.evaluate(`{
        const iter = jupyterlab.shell._dockPanel.widgets().iter();
        const widgets = [];
        for (let w = iter.next(); w; w = iter.next()) {
          widgets.push(w);
        }
        widgets.map(w => w.dispose());
      }`);
      await waitForLaunch();
    }
    // Version is only available on 1.3.0, using 1.0.2 for now
    let browserVerion: string;
    try {
      browserVerion = (browser as any).version();
    } catch {
      browserVerion = '';
    }

    if (!browserVerion) {
      if (browserName === "chromium") {
        browserVerion = "84.0.4135.0";
      } else if (browserName === "firefox"){
        browserVerion = "76.0b5";
      }
    }
    browserVersions[browserName] = browserVerion;
    await browser.close();
  }
  // Write a metadata file for the run to json file with the same
  // prefix as DATA_PATH
  const cpu = await si.cpu()
  const mem = await si.mem()
  const osInfo = await si.osInfo()

  let metadata: any = {
    browsers: browserVersions,
    notebookPackages: NOTEBOOK_PACKAGES,
    benchmark: {
      BENCHMARK_OUTPUT: DATA_PATH,
      BENCHMARK_MAX_N: MAX_N,
      BENCHMARK_NUMBER_SAMPLES: NUMBER_SAMPLES,
      BENCHMARK_SWITCHES: SWITCHES,
      BENCHMARK_MAX_TIME: MAX_TIME,
      TIME_OUT: TIME_OUT
    },
    manyCells: {
      CELLS_MULTIPLIER: CELLS_MULTIPLIER,
      CODE_CELL_RATIO: CODE_CELL_RATIO
    },
    manyOutputs: {
      MANY_OUTPUTS: MANY_OUTPUTS,
    },
    longOutput: {
      DIV_NUMBER: DIV_NUMBER,
    },
    fixedDataTable: {
      TABLE_COLUMNS: TABLE_COLUMNS,
      TABLE_ROWS: TABLE_ROWS,
    },
    systemInformation: {
      cpu: cpu,
      mem: mem,
      osInfo: osInfo
    }
  }
  const metadataPath: string = DATA_PATH.replace(".csv", ".json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 1));
})()
  .then(() => stream.close())
  .catch(reason => {
    throw reason;
  });
