# Issue Types

A notebook can present one or multiple issues. Issues are identified based on [user feedbacks](#User_Reports).

The cause of the issues can be present at different places which constitutes bootlenecks:

```                        
Browser <--> Client JS <------> API Server Endpoint  <-> Content Service <-> Notebook
  [A]           [B]       [C]                                 [D]
```

- [A] Browser Rendering
- [B] Client Parsing
- [C] Network Transmission
- [D] Nptebook Read + Parsing + Validation + Trust

The server-related bootlenecks are tracked for now in:

- Improving Network Performance <https://github.com/jupyter/jupyter_server/issues/312>
- Explore transferring content in chunks for incremental loading <https://github.com/jupyter/jupyter_server/issues/308>

## Issue 1 - Many Cell Editors

- Bootlenecks: [A]
- Benchmark: manyCells, errorOutputs
- Solution:
  - Content Visibility <https://github.com/jupyterlab/jupyterlab/pull/8970>
  - Box Display <https://github.com/jupyterlab/jupyterlab/pull/8968>
  - Virtual Notebook <https://github.com/jupyterlab/jupyterlab/pull/8972>

## Issue 2 - Large Text Output

- Bootlenecks: [A]
- Benchmark to run: `manyOutputs` `longOutput` `50000Errors`
- Solution
  - StrippedOutput
  - VirtualOutput

## Issue 3 - Many Rich Output

- Bootlenecks: [A] [D]
- Benchmark to run: `largePlotly`, `manyPlotly`
- Solution:
 - TBD

## Issue 4 - Large .ipynb file

- Bootlenecks: [A]
- Benchmark to run: `manyOutputs` `longOutput` `50000Errors`
- Solution
 - Server Memory cache

## User Reports

Some opened issues on [JupyterLab repository](https://github.com/jupyterlab/jupyterlab).

- [Switching to a big notebook in a tab is slow](https://github.com/jupyterlab/jupyterlab/issues/4292)  
- [Optimize editor refresh on notebook show](https://github.com/jupyterlab/jupyterlab/pull/5700/files)  
- [Very slow rendering of graphs with multiple graphs / plotly](https://github.com/jupyterlab/jupyterlab/issues/5738)  
- [UI responce times are slower than in notebook](https://github.com/jupyterlab/jupyterlab/issues/7613)  
- [Considerable slowdown in Firefox once notebook gets a bit larger](https://github.com/jupyterlab/jupyterlab/issues/1639)  
- [Unusable load times when opening notebooks with many cells](https://github.com/jupyterlab/jupyterlab/issues/8680)  
- [It takes a long time to load a slightly larger notebook](https://github.com/jupyterlab/jupyterlab/issues/5457)  
- [Slow toggling to a large notebook](https://github.com/jupyterlab/jupyterlab/issues/2639)  
- [Large notebooks hanging up](https://github.com/jupyterlab/jupyterlab/issues/6353)  
- [Find/replace is very slow for large notebooks](https://github.com/jupyterlab/jupyterlab/issues/6756)  

Other places talking about JupyterLab performance.

- [Cripplingly slow UI](https://discourse.jupyter.org/t/cripplingly-slow-ui-am-i-the-only-one/5351)  
- [Plotly Very slow render with many graphs](https://community.plotly.com/t/plotly-notebook-very-slow-render-with-many-graphs/16861/11)  
