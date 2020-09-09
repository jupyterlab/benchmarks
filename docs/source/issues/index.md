# Performance Issues

## Issues

Issues are identified based on [user feedbacks](#User_Reports).

A notebook can present one or multiple of the following issues.

### Many Cell Editors

- Benchmark to run: manyCells, errorOutputs
- Solution: Content Visibility (chrome85+), Virtual Notebook

### Large Text Output

- Benchmark to run: manyOutputs, longOutput
- Solution: Strip Output, Virtual Output

### Many Rich Output

- Benchmark to run: largePlotly, manyPlotly
- Solution: TBD

### Large .ipynb file

- Benchmark to run: manyOutputs, longOutput
- Solution: Memory cache

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
