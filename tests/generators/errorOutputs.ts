/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import { galata } from '@jupyterlab/galata';
import NotebookType from './notebookType';

// Adjust this value depending on the platform you run your benchmark.
// For really heavy notebooks, use STD_ERROR * n ~ 10000; for reasonable notebooks ~ 1000
const STD_ERROR = 10;

export default {
  label: `errorOutputs - ${STD_ERROR}x{N} errors output collected`,
  waitFor: async () => null,
  notebook: (n: number) => {
    const outputs = [];
    for (let i = 0; i < STD_ERROR * n; ++i) {
      outputs.push({
        ename: 'NameError',
        evalue: "name 'iAmNotDefined' is not defined",
        output_type: 'error',
        traceback: [
          '\u001b[0;31m---------------------------------------------------------------------------\u001b[0m',
          '\u001b[0;31mNameError\u001b[0m                                 Traceback (most recent call last)',
          '\u001b[0;32m<ipython-input-22-56e1109ae320>\u001b[0m in \u001b[0;36m<module>\u001b[0;34m\u001b[0m\n\u001b[0;32m----> 1\u001b[0;31m \u001b[0miAmNotDefined\u001b[0m\u001b[0;34m\u001b[0m\u001b[0;34m\u001b[0m\u001b[0m\n\u001b[0m',
          "\u001b[0;31mNameError\u001b[0m: name 'iAmNotDefined' is not defined"
        ]
      });
    }

    return galata.Notebook.makeNotebook([
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: outputs,
        source: [
          '# Imagine this cell called a function which runs things on a cluster and you have an error'
        ]
      }
    ]);
  }
} as NotebookType;
