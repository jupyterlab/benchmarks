# Benchmarks Tooling

This package is using [Playwright](https://playwright.dev/) to execute a given scenario with test notebooks.

## Running test

To run the test, you will need to

1. Start JupyterLab after compiling it at a reference state with the following command

```
jupyter lab --config tests/jupyter_lab_config.py
```

2. Run the tests against the reference

```
yarn install
yarn build
cd tests
yarn playwright install chromium
yarn test --project jupyterlab -u
```

3. Stop JupyterLab
4. Start JupyterLab after compiling it a challenger state

```
jupyter lab --config tests/jupyter_lab_config.py
```

5. Run the tests against the challenger

```
cd tests
yarn test --project jupyterlab
```

The benchmark report is generated in the folder `benchmark-results`.

![](./images/example.png)

It represents the execution time distribution for the reference JupyterLab version vs the challenger one. Each column represents a test notebook. And each row represents a measurement in the benchmark scenario:

- _open_: Time to open the notebook
- _switch-from-copy_: Time to switch from the notebook to its copy
- _switch-to-copy_: Time to switch back from the copy to the notebook
- _switch-from-txt_: Time to switch from the notebook to a text editor
- _switch-to-txt_: Time to switch back from the text editor to the notebook
- _close_: Time to close the notebook (and display the text editor)

## Test notebooks

The available notebook definitions are located in the [/src/notebooks](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/) folder (some have special requirements - see below):

- [`codeNotebook`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/codeNotebook.ts): Only lots of code cells (without outputs).
- [`errorOutputs`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/errorOutputs.ts): One cell with lots of error outputs.
- [`fixedDataTable`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/fixedDataTable.ts): Use test extension [fixed-data-table](https://github.com/jupyterlab/benchmarks/tree/master/extensions/fixed-data-table).
- [`largePlotly`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/largePlotly.ts): Four large Plotly.
- [`longOutput`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/longOutput.ts): One cell with one long HTML output.
- [`manyCells`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/manyCells.ts): Lots of cells.
- [`manyOutputs`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/manyOutputs.ts): Lots of outputs.
- [`manyPlotly`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/manyPlotly.ts): Lots of small Plotly.
- [`mdNotebook`](https://github.com/jupyterlab/benchmarks/tree/master/tests/generators/mdNotebook.ts): Only lots of markdown cells.

## Requirements

The test notebooks with Plotly requires to install `plotly` and `ipywigets`:

```sh
pip install plotly ipywidgets
```

If you need one of the test extension (like _fixed-data-table_), you can install it with:

```sh
pip install -v extensions/fixed-data-table
```

## Customization

The benchmark test can be customized through environment variables:
- BENCHMARK_NUMBER_SAMPLES [default : 100]: How many samples to compute the statistical distribution
- BENCHMARK_SWITCHES [default: 3]: How many times to switch between each tabs
- BENCHMARK_MAX_N [default: 100]: The test notebook size
- BENCHMARK_NOTEBOOKS [default: `["codeNotebook", "mdNotebook", "largePlotly", "longOutput", "manyPlotly", "manyOutputs", "errorOutputs"]`]: Notebooks to test

## Benchmarks comparison

The benchmarks comparison uses the technique from Tomas Kalibera and Richard Jones in their paper
["Quantifying Performance Changes with Effect Size Confidence Intervals."](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjEq7u9ovXqAhXYs54KHf3QCM0QFjACegQIBRAB&url=https%3A%2F%2Farxiv.org%2Fabs%2F2007.10899&usg=AOvVaw0ihkJJIaT6v95zlAtGtI2o) From their abstract:

> Inspired by statistical methods used in other fields of science, and building on results in statistics that did not make it to introductory textbooks, we present a statistical model that allows us both to quantify uncertainty in the ratio of (execution time) means and to design experiments with a rigorous treatment of those multiple sources of non-determinism that might impact measured performance. Better still, under our framework summaries can be as simple as “system A is faster than system B by 5.5% ± 2.5%, with 95% confidence”, a more natural statement than those derived from typical current practice, which are often misinterpreted.
