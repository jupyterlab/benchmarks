import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import "./../style/index.css";

const editorContent = document.querySelector("#editor-content");

const NUMBER_OF_PROSEMIRRORS = 1000;

for (let i = 0; i < NUMBER_OF_PROSEMIRRORS; i++) {
  let t = document.createElement('div');
  t.innerHTML = `<h3>Prose Mirror ${i}</h3>`
  editorContent.appendChild(t);
  const editor = document.createElement('div');
  editorContent.append(editor);
  const content = document.createElement('div');
  editorContent.append(content);
  const view = new EditorView(editor, {
    state: EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(content),
      plugins: [keymap(baseKeymap)]
    }),
    dispatchTransaction(transaction: Transaction) {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
    }
  });
  console.log(performance.now());  
}
