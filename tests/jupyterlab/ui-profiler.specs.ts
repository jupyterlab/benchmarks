import { benchmark, galata } from "@jupyterlab/galata";
import type { ContentsHelper } from "@jupyterlab/galata/lib/contents";
import type {
  IBenchmarkResult,
  ITimingOutcome,
  MenuOpenScenarioOptions,
  TabScenarioOptions,
  SidebarsScenarioOptions,
  DebuggerScenarioOptions,
  CompleterScenarioOptions,
  ScrollScenarioOptions,
  ExecutionTimeBenchmarkOptions,
} from "@jupyterlab/ui-profiler";
import * as path from "path";
import { test } from "../fixtures/ui-profiler";

const fileNames = [
  "gh-9757-reproducer.ipynb",
  // disabled for now as this one is really slow
  // "all-html-elements.ipynb",
  "empty.ipynb",
];

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

  for (const file of fileNames) {
    test(`open menu (background=${file})`, async ({
      page,
      tmpPath,
      profiler,
    }, testInfo) => {
      await page.notebook.openByPath(`${tmpPath}/${file}`);

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
            test: "menuOpen:execution-time",
            file: file,
            time: time,
          })
        );
      }
    });
  }

  test(`switch tabs`, async ({ page, tmpPath, profiler }, testInfo) => {
    const result = (await profiler.runBenchmark(
      {
        id: "tabSwitch",
        options: {
          tabs: [
            {
              path: `all-html-elements.ipynb`,
            },
            {
              path: `gh-9757-reproducer.ipynb`,
            },
            {
              path: `empty.ipynb`,
            },
          ],
        } as TabScenarioOptions,
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
          test: "tabSwitch:execution-time",
          time: time,
        })
      );
    }
  });

  test(`sidebarOpen`, async ({ page, tmpPath, profiler }, testInfo) => {
    const result = (await profiler.runBenchmark(
      {
        id: "sidebarOpen",
        options: {
          sidebars: [
            "table-of-contents",
            "jp-debugger-sidebar",
            "jp-property-inspector",
            "filebrowser",
            "extensionmanager.main-view",
            "jp-running-sessions",
          ],
        } as SidebarsScenarioOptions,
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
          test: "sidebarOpen:execution-time",
          time: time,
        })
      );
    }
  });

  test(`debugger`, async ({ profiler }, testInfo) => {
    const result = (await profiler.runBenchmark(
      {
        id: "debugger",
        options: {
          codeCells: [
            "[globals().__setitem__(f'x{i}', 'y') for i in range(1000)];",
            "z = 1",
          ],
          expectedNumberOfVariables: [1000, 1001],
          widgetPosition: "tab-after",
        } as DebuggerScenarioOptions as any,
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
          test: "debugger:execution-time",
          time: time,
        })
      );
    }
  });

  test(`completer`, async ({ page, tmpPath, profiler }, testInfo) => {
    const result = (await profiler.runBenchmark(
      {
        id: "completer",
        options: {
          editor: "Notebook",
          path: "",
          setup: {
            tokenCount: 1000,
            tokenSize: 50,
          },
          widgetPosition: "tab-after",
        } as CompleterScenarioOptions as any,
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
          test: "completer:execution-time",
          time: time,
        })
      );
    }
  });

  test(`scroll`, async ({ page, tmpPath, profiler }, testInfo) => {
    const result = (await profiler.runBenchmark(
      {
        id: "scroll",
        options: {
          editor: "Notebook",
          editorContent:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          // TODO: more cells in one, and less cell with cell-by-cell on in another
          cells: 100,
          cellByCell: false,
          path: "",
          widgetPosition: "tab-after",
        } as ScrollScenarioOptions as any,
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
          test: "scroll:execution-time",
          time: time,
        })
      );
    }
  });
});
