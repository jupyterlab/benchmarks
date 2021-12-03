/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import { galata } from '@jupyterlab/galata';
import waitForPlotly from './utils/waitForPlotly';
import NotebookType from './notebookType';

export default {
  label: 'largePlotly - 4 plotly outputs each with 1000x{N} points',
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
          `data = list(range(1000 * ${n}))\n`,
          'fig = go.Figure(data=go.Scatter(y=data, x=data))'
        ]
      },
      ...Array.from({ length: 4 }, () => ({
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
                  }))(Array.from({ length: n * 1000 }, (_, i) => i))
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
