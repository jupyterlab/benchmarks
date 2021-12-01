/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { galata } from '@jupyterlab/galata';
import NotebookType from './notebookType';

export const MANY_OUTPUTS = Number(process.env['MANY_OUTPUTS'] || 100);

export default {
  label: `manyOutputs - ${MANY_OUTPUTS}x{N} outputs each of a div`,
  waitFor: async () => null,
  notebook: (n: number) =>
    galata.Notebook.makeNotebook([
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: Array.from({ length: n * MANY_OUTPUTS }, (_, i) => ({
          data: {
            'text/plain': [
              `'I am a long string which is repeatedly added to the dom in separated divs: ${i}'`
            ]
          },
          metadata: {},
          output_type: 'display_data'
        })),
        source: [
          'from IPython.display import display\n',
          '\n',
          `for i in range(${n * MANY_OUTPUTS}):\n`,
          "    display('I am a long string which is repeatedly added to the dom in separated divs: %d' % i)"
        ]
      }
    ])
} as NotebookType;
