import { benchmark, galata } from "@jupyterlab/galata";
import type { ContentsHelper } from "@jupyterlab/galata/lib/contents";
import type { IBenchmarkResult, ITimingOutcome } from "@jupyterlab/ui-profiler";
import type { MenuOpenScenarioOptions } from "@jupyterlab/ui-profiler/lib/types/_scenario-menu-open";
import type { ExecutionTimeBenchmarkOptions } from "@jupyterlab/ui-profiler/lib/types/_benchmark-execution";
import * as path from "path";
import { test } from "../fixtures/ui-profiler";

const fileNames = ["gh-9757-reproducer.ipynb", "all-html-elements.ipynb"];

test.describe("Benchmark using UI Profiler", () => {
  let attachmentCommon: {
    browser: string;
    file: string;
    project: string;
  };
  let contents: ContentsHelper;

  // Upload test notebooks
  test.beforeAll(async ({ baseURL, tmpPath, browserName }, testInfo) => {
    contents = galata.newContentsHelper(baseURL);
    for (const fileName of fileNames) {
      await contents.uploadFile(
        path.resolve(__dirname, `../../../examples/manual/${fileName}`),
        `${tmpPath}/${fileName}`
      );
    }
    attachmentCommon = {
      browser: browserName,
      file: "N/A",
      project: testInfo.project.name,
    };
  });

  test("open menu", async ({ page, tmpPath, profiler }, testInfo) => {
    await page.notebook.openByPath(`${tmpPath}/gh-9757-reproducer.ipynb`);

    const result = (await profiler.runBenchmark(
      {
        id: "menuOpen",
        options: { menu: "file" } as MenuOpenScenarioOptions,
      },
      {
        id: "execution-time",
        options: {
          repeats: benchmark.nSamples,
        } as ExecutionTimeBenchmarkOptions,
      }
    )) as IBenchmarkResult<ITimingOutcome>;

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
