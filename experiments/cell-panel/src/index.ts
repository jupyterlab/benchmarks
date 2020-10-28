import { BoxPanel, Widget } from '@lumino/widgets';

import { CodeCellModel, CodeCell } from '@jupyterlab/cells';
import {
  RenderMimeRegistry,
  standardRendererFactories
} from '@jupyterlab/rendermime';

import '@jupyterlab/cells/style/index.css';
import '@jupyterlab/theme-light-extension/style/index.css';

import '../style/index.css';

const NUMBER_OF_CELLS = 1000;

const panel = new BoxPanel();
panel.id = 'main';
panel.direction = 'top-to-bottom';
panel.spacing = 0;

const editorContent = document.querySelector("#editor-content");
Widget.attach(panel, editorContent as HTMLElement);

for (let i = 0; i < NUMBER_OF_CELLS; i++) {
  const cell = new CodeCell({
    rendermime: new RenderMimeRegistry({
      initialFactories: standardRendererFactories
    }),
    model: new CodeCellModel({})
  }).initializeState();
  cell.activate();
  panel.addWidget(cell);
  console.log(performance.now());
}
/*
window.addEventListener('resize', () => {
  panel.update();
});
*/
