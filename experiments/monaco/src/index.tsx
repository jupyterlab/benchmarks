import * as monaco from 'monaco-editor';

import "./../style/index.css";

const NUMBER_OF_MONACOS = 1000;

const editorContent = document.querySelector("#editor-content") as HTMLElement;

// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') { 
			return './json.worker.bundle.js';
		}
		if (label === 'css') {
			return './css.worker.bundle.js';
		}
		if (label === 'html') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

for (let i = 0; i < NUMBER_OF_MONACOS; i++) {
//  let t = document.createElement('div');
//  t.innerHTML = `<h3>Monaco i</h3>`
//  editorContent.appendChild(t);
  let m = document.createElement('div');
  m.className = 'editor-monaco';
  // editorContent.appendChild(m);
  document.body.appendChild(m);
  monaco.editor.create(m, {
    value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
    language: 'typescript'
  });
  console.log(performance.now());  
}
