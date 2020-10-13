import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python'

import 'codemirror/lib/codemirror.css';
import './../style/index.css';

const editorContent = document.querySelector("#editor-content");

const NUMBER_OF_CODEMIRRORS = 1000;

for (let i = 0; i < NUMBER_OF_CODEMIRRORS; i++) {
  let t = document.createElement('div');
  t.innerHTML = `<h3>Code Mirror ${i}</h3>`
  editorContent.appendChild(t);
  let ce = document.createElement('div');
  ce.className = 'exp-code-mirrors'
  editorContent.appendChild(ce);
  const cm = CodeMirror(ce, {
    value: `print("Code Mirror ${i})"`,
    mode:  'python',
    lineNumbers: false,  
    viewportMargin: Infinity
  });
  console.log(performance.now());
}
