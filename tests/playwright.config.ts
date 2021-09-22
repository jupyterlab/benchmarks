// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export default {
  reportSlowTests: null,
  timeout: 60000,
  projects: [
    {
      name: "jupyterlab",
      testMatch: "jupyterlab/**",
      use: {
        // Remove codemirror cursor
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            codeCellConfig: { cursorBlinkRate: -1 },
            markdownCellConfig: { cursorBlinkRate: -1 },
            rawCellConfig: { cursorBlinkRate: -1 },
          },
        },
      },
    },
    {
      name: "retrolab",
      testMatch: "retrolab/**",
      use: {
        baseURL: "http://localhost:8890",
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            codeCellConfig: { cursorBlinkRate: -1 },
            markdownCellConfig: { cursorBlinkRate: -1 },
            rawCellConfig: { cursorBlinkRate: -1 },
          },
        },
      },
    },
    {
      name: "jlab-no-virtualization",
      testMatch: "jupyterlab/**",
      use: {
        mockSettings: {
          "@jupyterlab/fileeditor-extension:plugin": {
            editorConfig: { cursorBlinkRate: -1 },
          },
          "@jupyterlab/notebook-extension:tracker": {
            codeCellConfig: { cursorBlinkRate: -1 },
            markdownCellConfig: { cursorBlinkRate: -1 },
            rawCellConfig: { cursorBlinkRate: -1 },
            renderCellOnIdle: false,
            numberCellsToRenderDirectly: 10000000000000,
          },
        },
      },
    },
  ],
  reporter: [[process.env.CI ? "dot" : "list"], ["./benchmarkReporter"]],
  use: {
    // Browser options
    // headless: false,
    // slowMo: 500,
    // Context options
    viewport: { width: 1024, height: 768 },
    // Artifacts
    video: "retain-on-failure",
  },
  preserveOutput: "failures-only",
  workers: 1,
};
