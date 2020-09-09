import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python'

import 'codemirror/lib/codemirror.css';
import './index.css';

for (let i = 0; i < 500; i++) {
  let t = document.createElement('div');
  t.innerHTML = `<h3>Code Mirror ${i}</h3>`
  document.body.appendChild(t);
  let ce = document.createElement('div');
  ce.className = 'exp-code-mirrors'
  document.body.appendChild(ce);
  const cm = CodeMirror(ce, {
    value: `print("Cell ${i})"`,
    mode:  'python',
    lineNumbers: true,
  });
  cm.setSize('100%', '30px');
}
