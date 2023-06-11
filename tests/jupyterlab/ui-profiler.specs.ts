import { benchmark, galata, IJupyterLabPageFixture } from "@jupyterlab/galata";
import { JSONObject } from "@lumino/coreutils";
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
  BenchmarkOptions,
} from "@jupyterlab/ui-profiler";
import type {
  styleSheetsBenchmark,
  styleRuleBenchmark,
} from "@jupyterlab/ui-profiler/lib/styleBenchmarks";
import * as path from "path";
import { test } from "../fixtures/ui-profiler";

const fileNames = [
  "empty.ipynb",
  "div-span-svg-5k-each.ipynb", // also known as `gh-9757-reproducer.ipynb`
  "all-html-elements-100-each.ipynb",
];

interface ITestCase {
  /**
   * Scenario identifiers; by default will be inferred from the scenario key.
   */
  scenarioId?: string;
  /**
   * Scenario options
   */
  options: JSONObject | ((path: string) => JSONObject);
  /**
   * A positive multiplier for the samples to be taken; increase it for short
   * test to increase benchmarking precision. Defaults to `1`.
   */
  sampleMultiplier?: number;
  /**
   * Whether to open a test notebook. Defaults to `true`.
   */
  openNotebook?: boolean;
}

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const reference =
  process.env["BENCHMARK_REFERENCE"] ?? benchmark.DEFAULT_REFERENCE;

const scenarios: Record<string, ITestCase> = {
  completer: {
    options: {
      editor: "Notebook",
      path: "",
      setup: {
        tokenCount: 1000,
        tokenSize: 50,
      },
      widgetPosition: "split-right",
    } as CompleterScenarioOptions as any,
  },
  debugger: {
    options: {
      codeCells: [
        "[globals().__setitem__(f'x{i}', 'y') for i in range(1000)];",
        "z = 1",
      ],
      expectedNumberOfVariables: [1000, 1001],
      // TODO: ideally we would use `split-bottom` here, but it seems that
      // the other tab can steal focus for some reason (which is a bug).
      widgetPosition: "tab-after",
    } as DebuggerScenarioOptions as any,
  },
  menuOpen: {
    options: { menu: "file" } as MenuOpenScenarioOptions,
    sampleMultiplier: 15,
  },
  scroll: {
    options: {
      editor: "Notebook",
      editorContent: LOREM_IPSUM,
      cells: 200,
      cellByCell: false,
      path: "",
      widgetPosition: "split-right",
    } as ScrollScenarioOptions as any,
    sampleMultiplier: 5,
  },
  stepThroughCells: {
    scenarioId: "scroll",
    options: {
      editor: "Notebook",
      editorContent: LOREM_IPSUM,
      cells: 75,
      cellByCell: true,
      path: "",
      widgetPosition: "split-right",
    } as ScrollScenarioOptions as any,
    sampleMultiplier: 1,
  },
  sidebarOpen: {
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
    sampleMultiplier: 5,
  },
  tabSwitch: {
    options: (path: string) => {
      return {
        tabs: [
          {
            // Switch from launcher
            path: "",
          },
          {
            // To the provided notebook
            path: path,
          },
        ],
      } as TabScenarioOptions;
    },
    openNotebook: false,
    sampleMultiplier: 5,
  },
};

// FIXME: completer test is flaky
test.describe.configure({ retries: 3 });

// Upload test notebooks
test.beforeEach(async ({ baseURL, tmpPath }) => {
  const contents = galata.newContentsHelper(baseURL);
  if (!(await contents.directoryExists(tmpPath))) {
    await contents.createDirectory(tmpPath);
  }
  for (const fileName of fileNames) {
    await contents.uploadFile(
      path.resolve(__dirname, `../../../examples/manual/${fileName}`),
      `${tmpPath}/${fileName}`
    );
  }
});

test.afterEach(async ({ tmpPath, baseURL }) => {
  const contents = galata.newContentsHelper(baseURL);
  await contents.deleteDirectory(tmpPath);
});

async function acceptKernelDialog(page: IJupyterLabPageFixture) {
  const dialogLocator = page.locator(".jp-Dialog");
  try {
    // Wait up to three seconds for the kernel selection dialog to appear
    await dialogLocator.waitFor({ timeout: 3000 });
  } catch {
    // no-op
  }
  // If the kernel dialog shows up, accept default kernel
  if (await dialogLocator.isVisible()) {
    await page.click(".jp-Dialog .jp-mod-accept");
    await dialogLocator.waitFor({ state: "detached" });
  }
}

test.describe("Measure execution time", () => {
  for (const [id, scenario] of Object.entries(scenarios)) {
    for (const file of fileNames) {
      test(`${id} (notebook=${file})`, async ({
        browserName,
        page,
        tmpPath,
        profiler,
      }, testInfo) => {
        // 2 minutes for setup/teardown + 1 minute for each 25 samples
        test.setTimeout((benchmark.nSamples / 25 + 2) * 60 * 1000);
        const notebookPath = `${tmpPath}/${file}`;

        const scenarioId = scenario.scenarioId ?? id;
        const openNotebook = scenario.openNotebook ?? true;
        const multiplier = scenario.sampleMultiplier ?? 1;
        const options =
          scenario.options instanceof Function
            ? scenario.options(notebookPath)
            : scenario.options;

        if (openNotebook) {
          await page.notebook.openByPath(notebookPath);
          await acceptKernelDialog(page);
        }

        const result = (await profiler.runBenchmark(
          {
            id: scenarioId,
            options,
          },
          {
            id: "execution-time",
            options: {
              repeats: multiplier * benchmark.nSamples,
            } as ExecutionTimeBenchmarkOptions,
          }
        )) as IBenchmarkResult<ITimingOutcome>;

        const times = result.outcome.reference;
        for (let time of times) {
          testInfo.attachments.push(
            benchmark.addAttachment({
              benchmark: "execution-time",
              browser: browserName,
              test: `${id}:execution-time`,
              file: file,
              time: time,
              project: testInfo.project.name,
              profiler: true,
              granular: true,
            })
          );
        }
        testInfo.attach(`${reference}-${id}:execution-time.json`, {
          body: JSON.stringify({
            ...result,
            reference,
            backgroundTab: file,
          }),
          contentType: "application/json",
        });
      });
    }
  }
});

// TODO: drop Awaited polyfill once TypeScript 4.5 is on
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

test.describe("Benchmark style sheets @slow", () => {
  for (const [id, scenario] of Object.entries(scenarios)) {
    for (const file of fileNames) {
      test(`${id} (notebook=${file})`, async ({
        page,
        tmpPath,
        profiler,
      }, testInfo) => {
        // 2 minutes for setup/teardown + 1 minute for each 5 samples
        test.setTimeout((benchmark.nSamples / 5 + 2) * 60 * 1000 * 10);
        const notebookPath = `${tmpPath}/${file}`;

        const scenarioId = scenario.scenarioId ?? id;
        const openNotebook = scenario.openNotebook ?? true;
        const multiplier = scenario.sampleMultiplier ?? 1;
        const options =
          scenario.options instanceof Function
            ? scenario.options(notebookPath)
            : scenario.options;

        if (openNotebook) {
          await page.notebook.openByPath(notebookPath);
          await acceptKernelDialog(page);
        }

        const result = (await profiler.runBenchmark(
          {
            id: scenarioId,
            options,
          },
          {
            id: "style-sheet",
            options: {
              repeats: multiplier * benchmark.nSamples,
            } as BenchmarkOptions,
          }
        )) as IBenchmarkResult<
          Awaited<ReturnType<typeof styleSheetsBenchmark.run>>
        >;

        testInfo.attach(`${reference}-${id}:style-sheet.json`, {
          body: JSON.stringify({
            ...result,
            reference,
            backgroundTab: file,
          }),
          contentType: "application/json",
        });
      });
    }
  }
});

test.describe("Benchmark style rules @slow", () => {
  for (const [id, scenario] of Object.entries(scenarios)) {
    for (const file of fileNames) {
      test(`${id} (notebook=${file})`, async ({
        page,
        tmpPath,
        profiler,
      }, testInfo) => {
        // 2 minutes for setup/teardown + 2 minute for each sample
        test.setTimeout((benchmark.nSamples * 2 + 2) * 60 * 1000 * 10);
        const notebookPath = `${tmpPath}/${file}`;

        const scenarioId = scenario.scenarioId ?? id;
        const openNotebook = scenario.openNotebook ?? true;
        const multiplier = scenario.sampleMultiplier ?? 1;
        const options =
          scenario.options instanceof Function
            ? scenario.options(notebookPath)
            : scenario.options;

        if (openNotebook) {
          await page.notebook.openByPath(notebookPath);
          await acceptKernelDialog(page);
        }

        const result = (await profiler.runBenchmark(
          {
            id: scenarioId,
            options,
          },
          {
            id: "style-rule",
            options: {
              repeats: multiplier * benchmark.nSamples,
            } as BenchmarkOptions,
          }
        )) as IBenchmarkResult<
          Awaited<ReturnType<typeof styleRuleBenchmark.run>>
        >;

        testInfo.attach(`${reference}-${id}:style-rule.json`, {
          body: JSON.stringify({
            ...result,
            reference,
            backgroundTab: file,
          }),
          contentType: "application/json",
        });
      });
    }
  }
});
