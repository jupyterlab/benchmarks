import { BoxPanel, Widget } from '@lumino/widgets';

import { CodeCellModel, CodeCell } from '@jupyterlab/cells';
import {
  RenderMimeRegistry,
  standardRendererFactories
} from '@jupyterlab/rendermime';

import '@jupyterlab/cells/style/index.css';
import '@jupyterlab/theme-light-extension/style/index.css';

import '../style/index.css';

const panel = new BoxPanel();
panel.id = 'main';
panel.direction = 'top-to-bottom';
panel.spacing = 0;

/*
class="lm-Widget p-Widget jp-Cell jp-CodeCell jp-mod-noOutputs lm-BoxPanel-child p-BoxPanel-child"
style="position: absolute; top: 24200px; left: 0px; width: 1134px; height: 50px;"
*/
for (let i = 0; i < 500; i++) {
  const cell = new CodeCell({
    rendermime: new RenderMimeRegistry({
      initialFactories: standardRendererFactories
    }),
    model: new CodeCellModel({})
  }).initializeState();
  cell.activate();
  panel.addWidget(cell);
}

const t = document.createElement('div');
document.body.appendChild(t);
Widget.attach(panel, t);

window.addEventListener('resize', () => {
  panel.update();
});

