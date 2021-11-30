// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export default {
  reportSlowTests: null,
  timeout: 60000,
  projects: [
    {
      name: "jupyterlab",
      testMatch: "jupyterlab/**",
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
  reporter: [
    [process.env.CI ? "dot" : "list"],
    [
      "@jupyterlab/galata/lib/benchmarkReporter",
      { outputFile: "lab-benchmark.json" },
    ],
  ],
  use: {
    // Browser options
    // headless: false,
    // slowMo: 500,
    // Context options
    viewport: { width: 1024, height: 768 },
    // Artifacts
    video: "off", // "retain-on-failure",
    baseURL: process.env.TARGET_URL ?? 'http://127.0.0.1:9999'
  },
  preserveOutput: "failures-only",
  workers: 1,
};
