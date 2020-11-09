import CodeMirror from 'codemirror';

import 'codemirror/mode/python/python';
import 'codemirror/lib/codemirror.css';

import './../style/index.css';

const editorContent = document.querySelector("#editor-content");

const NUMBER_OF_CODEMIRRORS = 1000;

let t = document.createElement('div');
t.innerHTML = `<h3>Code Mirror Init</h3>`
editorContent.appendChild(t);
let ce = document.createElement('div');
ce.className = 'ExperimentCodeMirrors'
editorContent.appendChild(ce);
const cm = CodeMirror(ce, {
  value: `print("Code Mirror Init")\nline 2\nline 3`,
  mode:  'python',
  lineNumbers: false,  
  viewportMargin: Infinity
});
console.log(performance.now());

cm.startOperation();

for (let i = 0; i < NUMBER_OF_CODEMIRRORS; i++) {
  cm.operation(() => {
    let t = document.createElement('div');
    t.innerHTML = `<h3>Code Mirror ${i}</h3>`
    editorContent.appendChild(t);
    let ce = document.createElement('div');
    ce.className = 'ExperimentCodeMirrors'
    editorContent.appendChild(ce);
    const cm = CodeMirror(ce, {
      value: `print("Code Mirror ${i}")\nline 2\nline 3`,
      mode:  'python',
      lineNumbers: false,  
      viewportMargin: Infinity
    });
    console.log(performance.now());
  });
}

cm.endOperation();

const exp = document.querySelectorAll('.ExperimentCodeMirrors');
exp.forEach(el => {
  el.className = 'ExperimentCodeMirrors ExperimentContainNone'
});
console.log(performance.now());
