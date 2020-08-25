/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import makeNotebook from './../makeNotebook';
import NotebookType from './../notebookType';

export const DIV_NUMBER = Number(process.env['DIV_NUMBER'] || 100);

export default {
  label: `one output with ${DIV_NUMBER} n divs`,
  waitFor: async () => null,
  notebook: (n: number) =>
    makeNotebook([
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [
          {
            data: {
              'text/html': [
                `<div>${Array.from(
                  { length: n * DIV_NUMBER },
                  (_, i) =>
                    `<div>I am a long string in a div which is repeatedly added to one html object: ${i}</div>`
                ).join('')}</div>`
              ],
              'text/plain': ['<IPython.core.display.HTML object>']
            },
            execution_count: 1,
            metadata: {},
            output_type: 'execute_result'
          }
        ],
        source: [
          'from IPython.display import HTML\n',
          '\n',
          `HTML(f\'<div>{"".join("<div>I am a long string in a div which is repeatedly added to one html object: %d</div>" % i for i in range(${n *
            DIV_NUMBER}))}</div>\')`
        ]
      }
    ])
} as NotebookType;
