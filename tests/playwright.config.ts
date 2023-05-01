// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const disableNotebookCursorBlinking = {
  codeCellConfig: { cursorBlinkRate: -1 },
  markdownCellConfig: { cursorBlinkRate: -1 },
  rawCellConfig: { cursorBlinkRate: -1 },
}

export default {
  reportSlowTests: null,
  timeout: 90000,
  projects: [
    // JupyterLab 3 and later
    {
      name: "jupyterlab",
      testMatch: "jupyterlab/**",
    },
    // JupyterLab 1 or 2
    {
      name: "jupyterlab-1-2",
      testMatch: "jupyterlab-1-2/**",
    },
    {
      name: "testing",
      testMatch: "jupyterlab/**",
      use: {
        video: "retain-on-failure"
      }
    },
    {
      name: "retrolab",
      testMatch: "retrolab/**",
      use: {
        baseURL: "http://localhost:9980",
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking
          },
        },
      },
    },
    {
      // note: only implemented in JupyterLab 2.3 and 3.x
      name: "jupyterlab-renderCellOnIdle-on",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking,
            renderCellOnIdle: true,
            numberCellsToRenderDirectly: 100,
          },
        },
      },
    },
    {
      // note: only implemented in JupyterLab 2.3 and 3.x
      name: "jupyterlab-renderCellOnIdle-off",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking,
            renderCellOnIdle: false,
            numberCellsToRenderDirectly: 10000000000000,
          },
        },
      },
    },
    {
      // note: only implemented in JupyterLab 4
      name: "jupyterlab-windowingMode-full",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking,
            windowingMode: 'full'
          },
        },
      },
    },
    {
      // note: only implemented in JupyterLab 4
      name: "jupyterlab-windowingMode-defer",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking,
            windowingMode: 'defer'
          },
        },
      },
    },
    {
      // note: only implemented in JupyterLab 4
      name: "jupyterlab-windowingMode-none",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            ...disableNotebookCursorBlinking,
            windowingMode: 'none'
          },
        },
      },
    },
  ],
  reporter: [
    [process.env.CI ? "github" : "list"],
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    [
      "@jupyterlab/galata/lib/benchmarkReporter",
      { outputFile: "lab-benchmark.json" },
    ],
  ],
  use: {
    // Browser options
    browserName: process.env.BROWSER_NAME ?? 'chromium',
    // headless: false,
    // slowMo: 500,
    // Context options
    // Width of 1366 to ensure the notebook toolbar is visible even
    // when both sidebars are open
    viewport: { width: 1366, height: 768 },
    // Artifacts
    video: process.env.PW_VIDEO ? "on" : "off", // "retain-on-failure",
    baseURL: process.env.TARGET_URL ?? 'http://localhost:9999'
  },
  preserveOutput: "failures-only",
  workers: 1,
  retries: 0
};
