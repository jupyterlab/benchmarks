// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, Page } from '@playwright/test';
import { benchmark, galata, test } from '@jupyterlab/galata';
import path from 'path';

test.use({
  appPath: '/retro',
  tmpPath: 'test-performance-open',
  waitForApplication: async ({ baseURL }, use, testInfo) => {
    const waitIsReady = async (
      page: Page
    ): Promise<void> => {
      await page.waitForSelector('#filebrowser')
    };
    await use(waitIsReady);
  }
});

const codeNotebook = 'large_code_notebook.ipynb';
const mdNotebook = 'large_md_notebook.ipynb';
const textFile = 'lorem_ipsum.txt';

// Build test parameters list [file, index]
const parameters = [].concat(
  ...[codeNotebook, mdNotebook].map(file =>
    new Array<number>(benchmark.nSamples)
      .fill(0)
      .map((_, index) => [file, index])
  )
);

test.describe('Benchmark', () => {
  // Generate the files for the benchmark
  test.beforeAll(async ({ baseURL, tmpPath }) => {
    const contents = galata.newContentsHelper(baseURL);

    const codeContent = galata.Notebook.generateNotebook(300, 'code', [
      'for x in range(OUTPUT_LENGTH):\n',
      '    print(f"{PREFIX} {x}")'
    ]);

    await contents.uploadContent(
      JSON.stringify(codeContent),
      'text',
      `${tmpPath}/${codeNotebook}`
    );

    const mdContent = galata.Notebook.generateNotebook(300, 'markdown', [
      '# Demonstration of proper behaviour with non-LaTeX uses of `$`\n',
      '\n',
      '## This should be highlighted as a heading\n',
      '\n',
      'Sample code:\n',
      '\n',
      '    ```\n',
      '    echo $HOME\n',
      '    ```\n',
      '\n',
      '```shell\n',
      'echo $HOME\n',
      '```\n',
      '\n',
      'The code block below should be properly highlighted:\n',
      '\n',
      '```bash\n',
      'echo $HOME\n',
      '```\n',
      '\n',
      '\n',
      '### Heading\n',
      '\n',
      '`$test`\n',
      '\n',
      '### This heading should be highlighted too'
    ]);

    await contents.uploadContent(
      JSON.stringify(mdContent),
      'text',
      `${tmpPath}/${mdNotebook}`
    );

    const loremIpsum =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin molestie suscipit libero non volutpat. Suspendisse et tincidunt metus. Proin laoreet magna rutrum egestas tristique. Proin vel neque sit amet lectus egestas pellentesque nec quis nisl. Quisque faucibus condimentum leo, quis euismod eros ultrices in. Vivamus maximus malesuada tempor. Aliquam maximus maximus elit, ac imperdiet tellus posuere nec. Sed at rutrum velit. Etiam et lectus convallis, sagittis nibh sit amet, gravida turpis. Nulla nec velit id est tristique iaculis.\n\nDonec vel finibus mauris, eu tristique justo. Pellentesque turpis lorem, lobortis eu tincidunt non, cursus sit amet ex. Vivamus eget ligula a leo vulputate egestas a eu felis. Donec sollicitudin maximus neque quis condimentum. Cras vestibulum nulla libero, sed semper velit faucibus ac. Phasellus et consequat risus. Sed suscipit ligula est. Etiam ultricies ac lacus sit amet cursus. Nam non leo vehicula, iaculis eros eu, consequat sapien. Ut quis odio quis augue pharetra porttitor sit amet eget nisl. Vestibulum magna eros, rutrum ac nisi non, lobortis varius ipsum. Proin luctus euismod arcu eget sollicitudin. Praesent nec erat gravida, tincidunt diam eget, tempor tortor.';
    await contents.uploadContent(loremIpsum, 'text', `${tmpPath}/${textFile}`);
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
      context,
      page,
      tmpPath
    }, testInfo) => {
      const attachmentCommon = {
        nSamples: benchmark.nSamples,
        browser: browserName,
        file: path.basename(file, '.ipynb'),
        project: testInfo.project.name
      };

      page.dblclick(`text=${tmpPath}`)

      let newPage: Page;

      const openTime = await page.performance.measure(async () => {
        // Open the notebook and wait for the spinner
        [newPage] = await Promise.all([
          context.waitForEvent('page'),
          page.dblclick(`text=${file}`)
        ]);

        // Wait for spinner to be hidden
        await newPage.waitForSelector('[role="main"] >> .jp-SpinnerContent', {
          state: 'hidden'
        });
      });

      // Get only the document node to avoid noise from kernel and debugger in the toolbar
      let document = await newPage.waitForSelector('.jp-Notebook');
      newPage.waitForTimeout(50);  // Wait a bit
      expect(await document.screenshot()).toMatchSnapshot(
        `${file.replace('.', '-')}.png`
      );

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: 'open',
          time: openTime
        })
      );

      // Shutdown the kernel to be sure it does not get in our way (especially for the close action)
      await page.kernel.shutdownAll();

      // Close notebook
      const closeTime = await page.performance.measure(async () => {
        // Revert changes so we don't measure saving
        await newPage.close()
      });

      testInfo.attachments.push(
        benchmark.addAttachment({
          ...attachmentCommon,
          test: 'close',
          time: closeTime
        })
      );
    });
  }
});
