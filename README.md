# Jupyterlab Benchmarks

[![Join the chat at https://gitter.im/jupyterlab/Performance](https://badges.gitter.im/jupyterlab/Performance.svg)](https://gitter.im/jupyterlab/Performance?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository is a place to make JupyterLab fast.

It tracks with benchmarks tooling the performance evolution of [JupyterLab](http://github.com/jupyterlab/jupyterlab). Read more on the [documentation website](https://jupyterlab-benchmarks.readthedocs.io).

## Quickstart

The best way to use this project for benchmark test execution is to start a manual benchmark workflow in the repository actions for [performance](https://github.com/jupyterlab/benchmarks/actions/workflows/benchmark.yml) or [memory-leaks](https://github.com/jupyterlab/benchmarks/actions/workflows/benchmark.yml).


### Performance tests

The _performance_ tests will measure the execution of the following scenario: 

- Opening the test notebook
- Switching from the test notebook to a copy of it
- Switching back
- Switching from the test notebook to a text editor
- Switching back
- Search for a word
- Start the debugger
- Closing the test notebook

There are multiple test notebooks available and their size can be tune with a size parameter.

Those cases will be run on the provided challenger repo/branch and in the reference JupyterLab repo at a given branch. Then it will produce a report that can be downloaded as artifacts when done.

![benchmark-workflow](https://raw.githubusercontent.com/jupyterlab/benchmarks/master/docs/source/benchmarks/images/benchmark_workflow.png "benchmark-workflow")

The workflow parameters are:

- JupyterLab Git repo [required]: fork name in format _{owner}/{repo}_
- Git repository reference [required]: typically branch name of a PR
- Reference branch [default: `master`]: Branch on `jupyterlab/jupyterlab` to use a reference
- Number of samples [default: 100]: Number of experiments to run to build the statistical distribution of execution time
- Test notebooks to use [default: `["codeNotebook", "mdNotebook", "longOutput", "errorOutputs"]`]: 
The test notebooks to execute; the available test notebooks are: ["codeNotebook", "mdNotebook", "largePlotly", "longOutput", "manyPlotly", "manyOutputs", "errorOutputs"]
- Test files size [default: 100]: tests notebooks are parametrized with an integer that is proportional to their size. 

> You need to remember that a GitHub job is limited to 6 hours. This means you may need to either reduce the number of samples (be careful) or the list of test notebooks to fit that time span.

### Memory leaks

The following scenarios are tested for memory leaks:

- notebook: Create a new notebook and delete it.
- file-editor: Create a new text file.
- cell:
  - Add a cell (for all 3 types)
  - Move a cell by drag-and-drop (for all 3 types)

The workflow parameters are:

- JupyterLab Git repository [required]: fork name in format _{owner}/{repo}_
- Git repository branch [required]: typically branch name of a PR
- Number of samples [default: 7]: Number of experiments to run to detect memory leaks (prefer a prime number).

## License and notice

JupyterLab uses a shared copyright model that enables all contributors to maintain the copyright on their contributions. All code is licensed under the terms of the revised [BSD license](https://github.com/jupyterlab-benchmarks/jupyterlab/blob/master/LICENSE).
