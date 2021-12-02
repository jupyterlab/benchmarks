// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, test } from "@playwright/test";
import { benchmark, galata } from "@jupyterlab/galata";
import path from "path";
import NotebookType from "../generators/notebookType";

// The maximum N
const MAX_N = Number(process.env["BENCHMARK_MAX_N"] || 100);
// How many times to switch between each notebook
const SWITCHES = Number(process.env["BENCHMARK_SWITCHES"] || 10);
// Notebooks to test
const notebookEnv = process.env.BENCHMARK_NOTEBOOKS;
const NOTEBOOK_PACKAGES: Array<string> = notebookEnv
  ? JSON.parse(notebookEnv)
  : [
      "codeNotebook",
      "mdNotebook",
      "largePlotly",
      "longOutput",
      "manyPlotly",
      "manyOutputs",
      "errorOutputs",
    ];

const tmpPath = "test-performance";
const textFile = "lorem_ipsum.txt";

// Build test parameters list [file, index]
const parameters = [].concat(
  ...NOTEBOOK_PACKAGES.map((file) =>
    new Array<number>(benchmark.nSamples)
      .fill(0)
      .map((_, index) => [file, index])
  )
);

let generators: { [k: string]: NotebookType } = {};

test.describe("JupyterLab Benchmark", () => {
  // Generate the files for the benchmark
  test.beforeAll(async ({ baseURL }) => {
    const contents = galata.newContentsHelper(baseURL);

    const loadedGenerators = (
      await Promise.all(
        NOTEBOOK_PACKAGES.map((path) => import(`../generators/${path}`))
      )
    ).map((pkg) => pkg.default);

    for (let i = 0; i < loadedGenerators.length; i++) {
      generators[NOTEBOOK_PACKAGES[i]] = loadedGenerators[i];
    }

    await Promise.all(
      loadedGenerators.map((generator) => {
        const fileContent = generator.notebook(MAX_N);
        const name = generator.label.replace("{N}", MAX_N.toString());
        return contents
          .uploadContent(
            JSON.stringify(fileContent),
            "text",
            `${tmpPath}/${name}.ipynb`
          )
          .then(() => {
            // Create a copy of the notebook to test switching to a similar notebook
            return contents.uploadContent(
              JSON.stringify(fileContent),
              "text",
              `${tmpPath}/${name}_copy.ipynb`
            );
          });
      })
    );

    const loremIpsum =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin molestie suscipit libero non volutpat. Suspendisse et tincidunt metus. Proin laoreet magna rutrum egestas tristique. Proin vel neque sit amet lectus egestas pellentesque nec quis nisl. Quisque faucibus condimentum leo, quis euismod eros ultrices in. Vivamus maximus malesuada tempor. Aliquam maximus maximus elit, ac imperdiet tellus posuere nec. Sed at rutrum velit. Etiam et lectus convallis, sagittis nibh sit amet, gravida turpis. Nulla nec velit id est tristique iaculis.\n\nDonec vel finibus mauris, eu tristique justo. Pellentesque turpis lorem, lobortis eu tincidunt non, cursus sit amet ex. Vivamus eget ligula a leo vulputate egestas a eu felis. Donec sollicitudin maximus neque quis condimentum. Cras vestibulum nulla libero, sed semper velit faucibus ac. Phasellus et consequat risus. Sed suscipit ligula est. Etiam ultricies ac lacus sit amet cursus. Nam non leo vehicula, iaculis eros eu, consequat sapien. Ut quis odio quis augue pharetra porttitor sit amet eget nisl. Vestibulum magna eros, rutrum ac nisi non, lobortis varius ipsum. Proin luctus euismod arcu eget sollicitudin. Praesent nec erat gravida, tincidunt diam eget, tempor tortor.";
    await contents.uploadContent(loremIpsum, "text", `${tmpPath}/${textFile}`);
  });

  // Remove benchmark files
  test.afterAll(async ({ baseURL }) => {
    // Clean temporary file except on CI
    if (!process.env.CI) {
      const contents = galata.newContentsHelper(baseURL);
      await contents.deleteDirectory(tmpPath);
    }
  });

  // Loop on benchmark files nSamples times
  //  For each file, benchmark:
  //  - Open the file
  //  (
  //    - Switch to a copy of the file
  //    - Switch back to the file
  //    - Switch to a text file
  //    - Switch back to the file
  //  ) * SWITCHES times
  //  - Close the file
  for (const [file, sample] of parameters) {
    test(`measure ${file} - ${sample + 1}`, async ({
      baseURL,
      browserName,
      page,
    }, testInfo) => {
      const filename = generators[file].label.replace("{N}", MAX_N.toString());

      const attachmentCommon = {
        nSamples: benchmark.nSamples,
        browser: browserName,
        file: path.basename(filename, ".ipynb"),
        project: testInfo.project.name,
      };
      const perf = galata.newPerformanceHelper(page);

      await page.goto(baseURL + "?reset");

      // Workaround to wait for the theme
      // await page.waitForFunction(
      //   () => !!document.body.getAttribute("data-jp-theme-name")
      // );

      await page.click("#filebrowser >> .jp-BreadCrumbs-home");
      await page.dblclick(`#filebrowser >> text=${tmpPath}`);

      const openTime = await perf.measure(async () => {
        // Open the notebook and wait for the spinner
        await Promise.all([
          page.waitForSelector('[role="main"] >> .jp-SpinnerContent'),
          page.dblclick(`#filebrowser >> text=${filename}.ipynb`),
        ]);

        // Wait for spinner to be hidden
        await page.waitForSelector('[role="main"] >> .jp-SpinnerContent', {
          state: "hidden",
        });
      });

      // Check the notebook is correctly opened
      let panel = await page.$(
        '[role="main"] >> .jp-NotebookPanel[aria-labelledby="tab-key-1"]'
      );
      // Get only the document node to avoid noise from kernel and debugger in the toolbar
      let documentContent = await panel.$(".jp-Notebook");
      expect(await documentContent.screenshot()).toMatchSnapshot(
        `${file.replace(".", "-")}.png`
      );

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "open",
          time: openTime,
        })
      );

      // Open text file
      await page.dblclick(`#filebrowser >> text=${textFile}`);
      await page.waitForSelector(
        `div[role="main"] >> .lm-DockPanel-tabBar >> text=${path.basename(
          textFile
        )}`
      );

      // Open copied notebook
      await page.dblclick(`#filebrowser >> text=${filename}_copy.ipynb`);
      await page.waitForSelector(
        `div[role="main"] >> .lm-DockPanel-tabBar >> text=${path.basename(
          filename
        )}_copy.ipynb`
      );

      // Switch to test notebook
      await page.click(
        `div[role="main"] >> .lm-DockPanel-tabBar >> text=${filename}.ipynb`
      );

      // Shutdown the kernel to be sure it does not get in our way (especially for the close action)
      await page.click('li[role="menuitem"]:has-text("Kernel")');
      await page.click('ul[role="menu"] >> text=Shut Down All Kernels…');
      await page.click(':nth-match(button:has-text("Shut Down All"), 3)');

      // Switch #SWITCHES times between the file editor and the notebook
      for (let switchIdx = 0; switchIdx < SWITCHES; switchIdx++) {
        // Switch to copy
        const fromTimeCopy = await perf.measure(async () => {
          await page.click(
            `div[role="main"] >> .lm-DockPanel-tabBar >> text=${filename}_copy.ipynb`
          );
        });

        // Check the notebook is correctly opened
        panel = await page.$(
          '[role="main"] >> .jp-NotebookPanel[aria-labelledby="tab-key-3"]'
        );
        // Get only the document node to avoid noise from kernel and debugger in the toolbar
        documentContent = await panel.$(".jp-Notebook");
        expect(await documentContent.screenshot()).toMatchSnapshot(
          `${file.replace(".", "-")}.png`
        );

        testInfo.attachments.push(
          benchmark.addAttachment({
            ...attachmentCommon,
            test: "switch-from-copy",
            time: fromTimeCopy,
          })
        );

        // Switch back
        const toTimeCopy = await perf.measure(async () => {
          await page.click(
            `div[role="main"] >> .lm-DockPanel-tabBar >> text=${filename}.ipynb`
          );
        });

        // Check the notebook is correctly opened
        panel = await page.$(
          '[role="main"] >> .jp-NotebookPanel[aria-labelledby="tab-key-1"]'
        );
        // Get only the document node to avoid noise from kernel and debugger in the toolbar
        documentContent = await panel.$(".jp-Notebook");
        expect(await documentContent.screenshot()).toMatchSnapshot(
          `${file.replace(".", "-")}.png`
        );

        testInfo.attachments.push(
          benchmark.addAttachment({
            ...attachmentCommon,
            test: "switch-to-copy",
            time: toTimeCopy,
          })
        );

        // Switch text file
        const fromTime = await perf.measure(async () => {
          await page.click(
            `div[role="main"] >> .lm-DockPanel-tabBar >> text=${path.basename(
              textFile
            )}`
          );
        });

        const editorPanel = page.locator(
          'div[role="tabpanel"]:has-text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mole")'
        );
        await expect(editorPanel).toBeVisible();

        testInfo.attachments.push(
          benchmark.addAttachment({
            ...attachmentCommon,
            test: "switch-from-txt",
            time: fromTime,
          })
        );

        // Switch back
        const toTime = await perf.measure(async () => {
          await page.click(
            `div[role="main"] >> .lm-DockPanel-tabBar >> text=${filename}.ipynb`
          );
        });

        // Check the notebook is correctly opened
        panel = await page.$(
          '[role="main"] >> .jp-NotebookPanel[aria-labelledby="tab-key-1"]'
        );
        // Get only the document node to avoid noise from kernel and debugger in the toolbar
        documentContent = await panel.$(".jp-Notebook");
        expect(await documentContent.screenshot()).toMatchSnapshot(
          `${file.replace(".", "-")}.png`
        );

        testInfo.attachments.push(
          benchmark.addAttachment({
            ...attachmentCommon,
            test: "switch-to-txt",
            time: toTime,
          })
        );
      }

      // Close notebook
      await page.click('li[role="menuitem"]:has-text("File")');
      const closeTime = await perf.measure(async () => {
        await page.click('ul[role="menu"] >> text=Close Tab');
        // Revert changes so we don't measure saving
        const dimissButton = page.locator('button:has-text("Discard")');
        if (await dimissButton.isVisible({ timeout: 50 })) {
          await dimissButton.click();
        }
      });

      const editorPanel = page.locator(
        'div[role="tabpanel"]:has-text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mole")'
      );
      await expect(editorPanel).toBeVisible();

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "close",
          time: closeTime,
        })
      );
    });
  }
});