import { benchmark, galata, test } from '@jupyterlab/galata';
import type { ContentsHelper } from '@jupyterlab/galata/lib/contents';
import * as path from 'path';

const PROFILER_CARD_SELECTOR =
  '.jp-LauncherCard[title="Open JupyterLab UI Profiler"]';


const START_BUTTON_SELECTOR =
  '.up-BenchmarkLauncher-launchbar-buttons .jp-mod-accept';

const REPEATS_INPUT_SELECTOR = '#up-profiler-benchmark_repeats';

const COMPLETED_SELECTOR = '.up-mod-completed';

const fileNames = [
  'gh-9757-reproducer.ipynb',
  'all-html-elements.ipynb'
];


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

  test.beforeEach(async ({page}) => {
    const card = await page.waitForSelector(PROFILER_CARD_SELECTOR);
    await card.click();
  });

  test('open menu', async ({ page, tmpPath }, testInfo) => {

    // TODO: open a heavy notebook `all-html-elements.ipynb` in background
    // this should be implemented in jupyterlab-ui-profiler as a new field.

    const startButton = await page.waitForSelector(START_BUTTON_SELECTOR);
    await startButton.click();

    await page.waitForSelector(COMPLETED_SELECTOR);

    const repeatsInput = await page.waitForSelector(REPEATS_INPUT_SELECTOR);
    await repeatsInput.fill(benchmark.nSamples.toString());

    const resultHandle = await page.waitForSelector(
      '.up-BenchmarkHistory-file >> text=execution-time_menuOpen'
    );
    const resultFileName = await resultHandle.innerText();
    const file = await contents.getContentMetadata(`${tmpPath}/ui-profiler-results/${resultFileName}`);

    const times = JSON.parse(file.content).result.reference;
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