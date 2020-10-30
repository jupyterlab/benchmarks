# Issue Types

The cause of the issues can be located at different places and the sum of those single bootlenecks slow down the overall user experience.

```                         
Browser <--> Client JS <------> API Server Endpoint <-> Content Service <-> Notebook
  [A]           [B]       [C]                                 [D]

- [A] Browser Rendering
- [B] Client-side Notebook Parsing, Validation and Preparation
- [C] Server to Client Notebook Transmission over the Network
- [D] Server-side Notebook Read, Parsing, Validation, Trust
```

A notebook can present one or multiple issue types. Issues are identified based on [user report](./reports).

We have curated [notebook examples](https://github.com/jupyterlab/benchmarks/tree/master/examples) that demonstrates some issues. 

## Issue Type 1 - Many Cell Editors

- Bootlenecks: [B]
- Benchmark: `manyCells`, `errorOutputs`

## Issue Type 2 - Large Text Output

- Bootlenecks: [B]
- Benchmark to run: `manyOutputs` `longOutput` `50000Errors`

## Issue Type 3 - Many Rich Output

- Bootlenecks: [B] + [D]
- Benchmark to run: `largePlotly`, `manyPlotly`

## Issue Type 4 - Large .ipynb file

- Bootlenecks: [A] + [C] + [D]
- Benchmark to run: `manyOutputs` `longOutput` `50000Errors`
