import { Message } from '@lumino/messaging';
import { BoxPanel, Widget } from '@lumino/widgets';

import '../style/index.css';

class ContentWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    input.placeholder = 'Placeholder...';
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  constructor(name: string) {
    super({ node: ContentWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
    this.addClass(name.toLowerCase());
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }
}

let panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
panel.id = 'main';

const NUMBER_OF_CODEMIRRORS = 1000;

const colors = ['Red', 'Blue', 'Green', 'Yellow']

for (let i = 0; i < NUMBER_OF_CODEMIRRORS; i++) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  let r1 = new ContentWidget(color);
  panel.addWidget(r1);
}

const l = document.querySelector("#lumino") as HTMLElement;
Widget.attach(panel, l);

// BoxPanel.setStretch(dock, 1);
// window.onresize = () => { panel.update(); };
