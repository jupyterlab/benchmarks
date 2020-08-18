JupyterLab Benchmarks Documentation
===================================

**Benchmarking tools for JupyterLab**

This project goal is a place to make JupyerLab fast. For now, the scope is to optimize:

- Tab loading / switching speed for various content (300-500 ms switch time)
- Opening a new document

Out of scope (could become later in scope):

- Initial server start
- Initial page loading
- Build time
- Page Save time

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
```

```{toctree}
---
maxdepth: 2
caption: Benchmarks
---
benchmarks/index
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
