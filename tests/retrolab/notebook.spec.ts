// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, Page, test } from "@playwright/test";
import { benchmark, galata } from "@jupyterlab/galata";
import path from "path";
import NotebookType from "../generators/notebookType";

// The maximum N
const MAX_N = Number(process.env["BENCHMARK_MAX_N"] || 100);
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

test.describe("RetroLab Benchmark", () => {
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
  //  - Close the file
  for (const [file, sample] of parameters) {
    test(`measure ${file} - ${sample + 1}`, async ({
      baseURL,
      browserName,
      context,
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

      await page.goto(baseURL);

      page.dblclick(`text=${tmpPath}`);

      let newPage: Page;

      const openTime = await perf.measure(async () => {
        // Open the notebook and wait for the spinner
        [newPage] = await Promise.all([
          context.waitForEvent("page"),
          page.dblclick(`#filebrowser >> text=${filename}.ipynb`),
        ]);

        await newPage.waitForLoadState("domcontentloaded");

        // Wait for spinner to be hidden
        await newPage.waitForSelector('[role="main"] >> .jp-SpinnerContent', {
          state: "hidden",
        });
      });

      // Workaround to wait for the theme
      await newPage.waitForFunction(
        () => !!document.body.getAttribute("data-jp-theme-name")
      );

      // Get only the document node to avoid noise from kernel and debugger in the toolbar
      let documentPanel = await newPage.waitForSelector(".jp-Notebook");
      newPage.waitForTimeout(50); // Wait a bit
      expect(await documentPanel.screenshot()).toMatchSnapshot(
        `${file.replace(".", "-")}.png`
      );

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: "open",
          time: openTime,
        })
      );

      // Close notebook
      const closeTime = await perf.measure(async () => {
        // Revert changes so we don't measure saving
        await newPage.close();
      });

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
