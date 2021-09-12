// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const baseConfig = require("@jupyterlab/galata/lib/playwright-config");

module.exports = {
  ...baseConfig,
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
        baseURL: 'http://localhost:8890',
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
  use: { ...baseConfig.use, video: "off" },
  preserveOutput: "failures-only",
  workers: 1,
};
