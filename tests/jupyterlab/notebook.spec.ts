// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from "@playwright/test";
import { benchmark, galata, test } from "@jupyterlab/galata";
import path from "path";
import NotebookType from "../generators/notebookType";

test.use({
  tmpPath: "test-performance-open",
});

const files = [
  "codeNotebook",
  "mdNotebook",
  "largePlotly",
  "longOutput",
  "manyPlotly",
  "manyOutputs",
  "errorOutputs",
];
const textFile = "lorem_ipsum.txt";

// Build test parameters list [file, index]
const parameters = [].concat(
  ...files.map((file) =>
    new Array<number>(benchmark.nSamples)
      .fill(0)
      .map((_, index) => [file, index])
  )
);

let generators: {[k: string]: NotebookType} = {};

test.describe("Benchmark", () => {
  // Generate the files for the benchmark
  test.beforeAll(async ({ baseURL, tmpPath }) => {
    const contents = galata.newContentsHelper(baseURL);

    const loadedGenerators = (
      await Promise.all(files.map((path) => import(`../generators/${path}`)))
    ).map((pkg) => pkg.default);

    for(let i=0; i < loadedGenerators.length; i++) {
      generators[files[i]] = loadedGenerators[i]
    }

    await Promise.all(
      loadedGenerators.map((generator) => {
        const n = 100;
        const fileContent = generator.notebook(n);
        const name = generator.label.replace("{N}", n.toString());
        return contents.uploadContent(
          JSON.stringify(fileContent),
          "text",
          `${tmpPath}/${name}.ipynb`
        );
      })
    );

    const loremIpsum =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin molestie suscipit libero non volutpat. Suspendisse et tincidunt metus. Proin laoreet magna rutrum egestas tristique. Proin vel neque sit amet lectus egestas pellentesque nec quis nisl. Quisque faucibus condimentum leo, quis euismod eros ultrices in. Vivamus maximus malesuada tempor. Aliquam maximus maximus elit, ac imperdiet tellus posuere nec. Sed at rutrum velit. Etiam et lectus convallis, sagittis nibh sit amet, gravida turpis. Nulla nec velit id est tristique iaculis.\n\nDonec vel finibus mauris, eu tristique justo. Pellentesque turpis lorem, lobortis eu tincidunt non, cursus sit amet ex. Vivamus eget ligula a leo vulputate egestas a eu felis. Donec sollicitudin maximus neque quis condimentum. Cras vestibulum nulla libero, sed semper velit faucibus ac. Phasellus et consequat risus. Sed suscipit ligula est. Etiam ultricies ac lacus sit amet cursus. Nam non leo vehicula, iaculis eros eu, consequat sapien. Ut quis odio quis augue pharetra porttitor sit amet eget nisl. Vestibulum magna eros, rutrum ac nisi non, lobortis varius ipsum. Proin luctus euismod arcu eget sollicitudin. Praesent nec erat gravida, tincidunt diam eget, tempor tortor.";
    await contents.uploadContent(loremIpsum, "text", `${tmpPath}/${textFile}`);
  });

  // Remove benchmark files
  test.afterAll(async ({ baseURL, tmpPath }) => {
    const contents = galata.newContentsHelper(baseURL);
    await contents.deleteDirectory(tmpPath);
  });

  // Loop on benchmark files nSamples times
  //  For each file, benchmark:
  //  - Open the file
  //  - Switch to a text file
  //  - Switch back to the file
  //  - Close the file
  for (const [file, sample] of parameters) {
    test(`measure ${file} - ${sample + 1}`, async ({
      browserName,
      page,
      tmpPath,
    }, testInfo) => {
      const attachmentCommon = {
        nSamples: benchmark.nSamples,
        browser: browserName,
        file: path.basename(file, ".ipynb"),
        project: testInfo.project.name,
      };

      const openTime = await page.performance.measure(async () => {
        // Open the notebook and wait for the spinner
        await Promise.all([
          page.waitForSelector('[role="main"] >> .jp-SpinnerContent'),
          page.notebook.openByPath(`${tmpPath}/${file}`),
        ]);

        // Wait for spinner to be hidden
        await page.waitForSelector('[role="main"] >> .jp-SpinnerContent', {
          state: "hidden",
        });

        // if (file === mdNotebook) {
        //   // Wait for Latex rendering => consider as acceptable to require additional time
        //   await page.waitForSelector('[role="main"] >> text=𝜌');
        // }
        // // Wait for kernel readiness => consider this is acceptable to take additional time
        // await page.waitForSelector(`#jp-main-statusbar >> text=Idle`);
      });

      // Check the notebook is correctly opened
      let panel = await page.activity.getPanel();
      // Get only the document node to avoid noise from kernel and debugger in the toolbar
      let document = await panel.$(".jp-Notebook");
      expect(await document.screenshot()).toMatchSnapshot(
        `${file.replace(".", "-")}.png`
      );

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "open",
          time: openTime,
        })
      );

      // Shutdown the kernel to be sure it does not get in our way (especially for the close action)
      await page.kernel.shutdownAll();

      // Open text file
      await page.filebrowser.revealFileInBrowser(`${tmpPath}/${textFile}`);

      const fromTime = await page.performance.measure(async () => {
        await page.filebrowser.open(textFile);
        await page.waitForCondition(
          async () => await page.activity.isTabActive(path.basename(textFile))
        );
      });

      let editorPanel = await page.activity.getPanel();
      expect(await editorPanel.screenshot()).toMatchSnapshot("loremIpsum.png");

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "switch-from",
          time: fromTime,
        })
      );

      // Switch back
      const toTime = await page.performance.measure(async () => {
        await page.notebook.openByPath(`${tmpPath}/${file}`);
      });

      // Check the notebook is correctly opened
      panel = await page.activity.getPanel();
      // Get only the document node to avoid noise from kernel and debugger in the toolbar
      document = await panel.$(".jp-Notebook");
      expect(await document.screenshot()).toMatchSnapshot(
        `${file.replace(".", "-")}.png`
      );

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "switch-to",
          time: toTime,
        })
      );

      // Close notebook
      const closeTime = await page.performance.measure(async () => {
        // Revert changes so we don't measure saving
        await page.notebook.close(true);
      });

      editorPanel = await page.activity.getPanel();
      expect(await editorPanel.screenshot()).toMatchSnapshot("loremIpsum.png");

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
