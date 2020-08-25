/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import makeNotebook from './../makeNotebook';
import NotebookType from './../notebookType';

export const TABLE_ROWS = Number(process.env['TABLE_ROWS'] || 5000);
export const TABLE_COLUMNS = Number(process.env['TABLE_COLUMNS'] || 50);

export default {
  label: `n fixed data table outputs each with ${TABLE_COLUMNS} columns and ${TABLE_ROWS} rows`,
  waitFor: async () => null,
  notebook: (n: number) =>
    makeNotebook([
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [],
        source: [
          'from IPython.display import display\n',
          "def Table(data=''):\n",
          '    bundle = {}\n',
          "    bundle['text/csv'] = data\n",
          '    display(bundle, raw=True)\n',
          '    \n',
          `example_data = '\\n'.join(';'.join([str(x) for x in range(${TABLE_COLUMNS})]) for y in range(${TABLE_ROWS}))\n`
        ]
      },
      ...Array.from({ length: n }, () => ({
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [
          {
            data: {
              'text/csv': Array.from(
                { length: TABLE_ROWS },
                () =>
                  Array.from({ length: TABLE_COLUMNS }, (_, i) => i).join(';') + '\n'
              )
            },
            metadata: {},
            output_type: 'display_data'
          }
        ],
        source: ['Table(example_data)']
      }))
    ])
} as NotebookType;
