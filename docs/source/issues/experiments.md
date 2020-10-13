# Experiments

[Experiments](https://github.com/jupyterlab/benchmarks/tree/master/experiments) to find the root cause of the issues.

Comparison for `DOMContentLoaded` (seconds) for 1000 editors.

- 1000 JupyterLab Cells: 50 seconds.
- 1000 JupyterLab Cells in a Lumino BoxPanel: 10 seconds for DOMContentLoaded, cells are only shown after 140 seconds.
- 1000 CodeMirrors: 50 seconds.
- 1000 Monaco: 40 seconds for DOMContentLoaded, editors are only shown after 60 seconds.
- 1000 ProseMirror (basic version): 2 seconds.
- 1000 ReMirror: 50 seconds.

Time measures from 1 to 1000 CodeMirror editors.

![](images/codemirrors.png "")
