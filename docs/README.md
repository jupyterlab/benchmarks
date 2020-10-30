# JupyterLab Benchmarks Docs

This folder contains content for the [JupyterLab Benchmarks ReadTheDocs website](https://jupyterlab-benchmarks.readthedocs.io).

```bash
# Install and build the doc site.
git clone https://github.com/jupyterlab/benchmarks && \
  cd benchmarks && \
  pip install -e .[rtd] && \
  cd docs && \
  rm -fr build && \
  make html && \
  open build/html/index.html
```
