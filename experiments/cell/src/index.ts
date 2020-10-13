import { CodeCellModel, CodeCell } from '@jupyterlab/cells';
import { RenderMimeRegistry, standardRendererFactories } from '@jupyterlab/rendermime';

import '@jupyterlab/cells/style/index.css';
import '@jupyterlab/theme-light-extension/style/index.css';

import '../style/index.css';

const NUMBER_OF_CELLS = 1000;

const editorContent = document.querySelector("#editor-content");
const cells = new Array<CodeCell>();

for (let i = 0; i < NUMBER_OF_CELLS; i++) {
  const cell = new CodeCell({
    rendermime: new RenderMimeRegistry({
      initialFactories: standardRendererFactories
    }),
    model: new CodeCellModel({})
  }).initializeState();
  cells.push(cell);
}

cells.forEach((cell, index) => {
  cell.activate();
  console.log(`activate ${index}`, performance.now());  
});

cells.forEach((cell, index) => {
  editorContent?.append(cell.node);
  console.log(`add ${index} to dom`, performance.now());  
});
