# Benchmarks on CI

The CI (continuous integration implemented with GitHub Actions) runs the [benchmarks](./../benchmarks/index) with specific tests and revisions.

For example, [linux-manyCells-manyOutputs](https://github.com/jupyterlab/benchmarks/blob/master/.github/workflows/linux-manyCells-manyOutputs.yml) runs the `manyCells` and `manyOutputs` on 2 revisions defined in `JLAB_COMMITS` environment variable.

The notebooks, results and comparisons are uploaded as Github Actions artifacts that you can download from the upper-right menu `Artifacts` from a specific build (e.g. [this link](https://github.com/jupyterlab/benchmarks/runs/1034124003?check_suite_focus=true)).
