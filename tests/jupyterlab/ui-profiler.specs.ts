import { benchmark, galata, test } from '@jupyterlab/galata';
import type { ContentsHelper } from '@jupyterlab/galata/lib/contents';
import type { IUIProfiler, IBenchmarkResult, ITimingOutcome } from '@jupyterlab/ui-profiler'
import type { MenuOpenScenarioOptions } from '@jupyterlab/ui-profiler/lib/types/_scenario-menu-open';
import type { ExecutionTimeBenchmarkOptions } from '@jupyterlab/ui-profiler/lib/types/_benchmark-execution';
import * as path from 'path';

const fileNames = [
  'gh-9757-reproducer.ipynb',
  'all-html-elements.ipynb'
];

const PROFILER_PLUGIN = '@jupyterlab/ui-profiler:plugin';


function getProfiler(): IUIProfiler {
  return (window as any).jupyterapp._plugins.get(PROFILER_PLUGIN).service;
}


test.describe('Benchmark using UI Profiler', () => {

  let attachmentCommon: {
    browser: string,
    file: string,
    project: string,
  };
  let contents: ContentsHelper;

  // Upload test notebooks
  test.beforeAll(async ({ baseURL, tmpPath, browserName }, testInfo) => {
    contents = galata.newContentsHelper(baseURL);
    for (const fileName of fileNames) {
      await contents.uploadFile(
        path.resolve(__dirname, `./examples/manual/${fileName}`),
        `${tmpPath}/${fileName}`
      );

    }
    attachmentCommon = {
      browser: browserName,
      file: 'N/A',
      project: testInfo.project.name,
    };
  });

  test('open menu', async ({ page, tmpPath }, testInfo) => {

    // TODO: open a heavy notebook `all-html-elements.ipynb` in background
    // this should be implemented in jupyterlab-ui-profiler as a new field.

    const result = await page.evaluate(
      async ([repeats]) => {
        const profiler = getProfiler();
        const result = await profiler.runBenchmark({
          id: 'menuOpen',
          options: {"menu": "file"} as MenuOpenScenarioOptions
        }, {
          id: 'execution-time',
          options: {"repeats": repeats} as ExecutionTimeBenchmarkOptions
        });
        return result;
      },
      [benchmark.nSamples]
    ) as IBenchmarkResult<ITimingOutcome>;

    const times = result.outcome.reference;
    for (let time of times) {
      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "open menu",
          time: time,
        })
      );
    }
  });
});