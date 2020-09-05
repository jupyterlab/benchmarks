# Jupyterlab Benchmarks

This repository is a place to make JupyterLab fast.

It tracks with benchmarks tooling the performance evolution of [JupyterLab](http://github.com/jupyterlab/jupyterlab). Read more on the [documentation website](https://jupyterlab-benchmarks.readthedocs.io).

```bash
# Quick start benchmark.
export JLAB_HOME=<the_folder_with_your_jupyterlab_source>
git clone https://github.com/jupyterlab/benchmarks && \
  cd benchmarks && \
  jlpm && \
  env 'BENCHMARK_NOTEBOOKS=["./longOutput", "./manyOutputs"]' jlpm all
```

![benchmark-result](https://raw.githubusercontent.com/jupyterlab/benchmarks/master/docs/source/benchmarks/images/example.png "benchmark-result")
