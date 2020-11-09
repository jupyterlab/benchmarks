import {EditorState, EditorView, basicSetup} from "@codemirror/next/basic-setup"
import {html} from "@codemirror/next/lang-html"

const editorContent = document.querySelector("#editor-content");

const NUMBER_OF_CODEMIRRORS = 1000;

for (let i = 0; i < NUMBER_OF_CODEMIRRORS; i++) {
  let t = document.createElement('div');
  t.innerHTML = `<h3>Code Mirror ${i}</h3>`
  editorContent.appendChild(t);
  let ce = document.createElement('div');
  ce.className = 'ExperimentCodeMirrors'
  editorContent.appendChild(ce);
  let state = EditorState.create({
    doc: `<script>
const {readFile} = require("fs");
readFile("package.json", "utf8", (err, data) => {
  console.log(data);
});
</script>`,
    extensions: [ basicSetup, html() ]});
  new EditorView({state, parent: ce!})
  console.log(performance.now());
}
console.log(performance.now());
