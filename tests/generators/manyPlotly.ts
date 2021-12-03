/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import waitForPlotly from './utils/waitForPlotly';
import { galata } from '@jupyterlab/galata';
import NotebookType from './notebookType';

export default {
  label: 'manyPlotly - {N}+1 plotly ouputs each with four points',
  waitFor: waitForPlotly,
  notebook: (n: number) =>
    galata.Notebook.makeNotebook([
      {
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [],
        source: [
          'import plotly.graph_objects as go\n',
          `data = list(range(4))\n`,
          `fig = go.Figure(data=go.Scatter(y=data, x=data))`
        ]
      },
      ...Array.from({ length: n + 1 }, () => ({
        cell_type: 'code',
        execution_count: 1,
        metadata: {},
        outputs: [
          {
            data: {
              'application/vnd.plotly.v1+json': {
                config: {
                  plotlyServerURL: 'https://plot.ly'
                },
                data: [
                  (points => ({
                    type: 'scatter',
                    x: points,
                    y: points
                  }))(Array.from({ length: 4 }, (_, i) => i))
                ],
                layout: {
                  autosize: true
                }
              }
            },
            metadata: {},
            output_type: 'display_data'
          }
        ],
        source: ['fig']
      }))
    ])
} as NotebookType;
