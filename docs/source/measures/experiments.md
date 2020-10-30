# Experiments

The [experiments](https://github.com/jupyterlab/benchmarks/tree/master/experiments) folder contains code useful to find the root cause of the issues.

## Editor Comparison

We compare for different editor technologies the time (in seconds) needed to receive the `DOMContentLoaded` event for 1000 editors.

- 1000 JupyterLab Cells: 50 seconds.
- 1000 JupyterLab Cells in a Lumino BoxPanel: 10 seconds for DOMContentLoaded, cells are only shown after 140 seconds.
- 1000 CodeMirrors: 50 seconds.
- 1000 Monaco: 40 seconds for DOMContentLoaded, editors are only shown after 60 seconds.
- 1000 ProseMirror (basic version): 2 seconds.
- 1000 ReMirror: 50 seconds.

The time measures from 1 to 1000 CodeMirror editors show an exponential nature.

![](images/codemirrors.png "")

## Lumino actions on resize

- https://github.com/jupyterlab/lumino/blob/master/packages/widgets/src/widget.ts#L610  
- https://github.com/jupyterlab/jupyterlab/search?q=onResize  
- https://github.com/jupyterlab/lumino/search?q=onResize  
