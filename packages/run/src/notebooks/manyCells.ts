/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import makeNotebook from './../makeNotebook';
import NotebookType from './../notebookType';

export const CELLS_MULTIPLIER = Number(process.env['CELLS_MULTIPLIER'] || 5);  // Default was 100
export const CODE_CELL_RATIO = Number(process.env['CODE_CELL_RATIO'] || 0.9);

export default {
  label: `manyCells - ${CELLS_MULTIPLIER}×{N} cells with 2 lines of code and 2 outputs per cell (${Math.round((1-CODE_CELL_RATIO)*100)}% of markdown)`,
  waitFor: async () => null,
  notebook: (n: number) => {  
    const totalCells = CELLS_MULTIPLIER * n;
    const numCodeCells = totalCells * CODE_CELL_RATIO;
    const numMarkdownCells = totalCells - numCodeCells;
    const cells = [];
    for (let i = 0; i < numMarkdownCells; ++i) {
      cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: [`# MD cell ${i}`]
      });
    }
    for (let i = 0; i < numCodeCells; ++i) {
      cells.push({
        'cell_type': 'code',
        'execution_count': 1,
        'metadata': {},
        'outputs': [
          {
            'name': 'stdout',
            'output_type': 'stream',
            'text': [
              '1\n'
            ]
          },
          {
            'name': 'stderr',
            'output_type': 'stream',
            'text': [
              '2\n'
            ]
          }
        ],
        'source': [
          'import sys\n',
          'print(\'1\')\n',
          'print(\'2\', file=sys.stderr)'
        ]
      });
    }

    return makeNotebook(cells);
  }
} as NotebookType;