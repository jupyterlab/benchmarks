# Memory leak on CI

You need to start a manual benchmark workflow in the [repository actions](https://github.com/jupyterlab/benchmarks/actions/workflows/memory-leak.yml).
It will execute the following scenarios for memory leaks:

- notebook: Create a new notebook and delete it.
- file-editor: Create a new text file.
- cell:
  - Add a cell (for all 3 types)
  - Move a cell by drag-and-drop (for all 3 types)

The workflow parameters are:

- JupyterLab Git repository [required]: fork name in format _{owner}/{repo}_
- Git repository branch [required]: typically branch name of a PR
- Number of samples [default: 7]: Number of experiments to run to detect memory leaks (prefer a prime number).
