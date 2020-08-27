JupyterLab Benchmarks Documentation
===================================

**Benchmarking tools for JupyterLab**

This project goal is a place to make JupyerLab fast. For now, the scope is to optimize:

- Opening a new notebook document.
- Tab loading and switching speed for various notebook content. An acceptable time is 300-500 ms switch time.

Out of scope (could become later in scope):

- Initial server start.
- Initial HTML page loading.
- Page Save time.
- Build time.

We iterate in steps:

1. Identify the perfomance issues.
1. Run Benchmark to have a baseline and be able to compare with fixes.
1. Profile the Page rendering to identify where bottlenecks reside.
1. Implement fixes.

## Site Contents

```{toctree}
---
maxdepth: 2
caption: Issues
---
issues/index
issues/solutions
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
caption: Profiling
---
profiling/index
```

```{toctree}
---
maxdepth: 2
caption: Fixes
---
fixes/index
```

```{toctree}
---
maxdepth: 2
caption: Links
---
GitHub repo <https://github.com/jupyterlab/benchmarks>
```

