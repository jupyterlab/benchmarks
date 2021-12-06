JupyterLab Benchmarks Documentation
===================================

**Benchmarking tools for JupyterLab**

This project is a place to make JupyterLab faster. For now, we want to optimize for various notebook content:

1. Opening a new notebook.
1. Switching tabs. An acceptable time is 300-500 ms switch time.
1. Closing a notebook

The following is out-of-scope, but could become later in-scope:

1. Initial server start.
1. Initial HTML page loading.
1. Notebok saveing time.
1. Build time.

We iterate in steps:

1. Identify the [types of issue](./issues/types) and measure what is going on with e.g. [experiments](./measures/experiments) and [profiling](./measures/profiling). We also understand the notebook [lifecycle](./measures/lifecycle)
1. Build [benchmark tooling](./benchmarks/index) to have a baseline and be able to compare with fixes.
1. Define fix [strategies](./fixes/strategies) and [implement](./fixes/implementations) those fixes.

## Site Contents

```{toctree}
---
maxdepth: 2
caption: Issues
---
issues/types
issues/reports
```

```{toctree}
---
maxdepth: 2
caption: Measures
---
measures/experiments
measures/lifecycle
measures/profiling
measures/telemetry
measures/jaeger
measures/lighthouse
```

```{toctree}
---
maxdepth: 2
caption: Benchmarks
---
benchmarks/index
benchmarks/ci
```

```{toctree}
---
maxdepth: 2
caption: Fixes
---
fixes/strategies
fixes/implementations
```

```{toctree}
---
maxdepth: 2
caption: Links
---
GitHub repo <https://github.com/jupyterlab/benchmarks>
```
