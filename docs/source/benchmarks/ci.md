# Benchmarks on CI

The CI (GitHub Actions) runs the [benchmarks](./../benchmarks/index) with specific tests and revisions.

For example, [linux-manyCells-manyOutputs](https://github.com/jupyterlab/benchmarks/blob/master/.github/workflows/linux-manyCells-manyOutputs.yml) will run the `manyCells` and `manyOutputs` on 2 revisions defined in `JLAB_COMMITS` environement variable.

The notebooks, results and comparisons are uploaded as Github Actions artifacts that you can download from the upper-right menu `Artifcats` from a specific build (e.g. [this page](https://github.com/jupyterlab/benchmarks/runs/1034124003?check_suite_focus=true)).

Currently we run the `manyCells-ManyOutputs` tests on CI using Github Actions.
