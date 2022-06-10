# Memory Leak Tooling

This package is using [fuite](https://github.com/nolanlawson/fuite) to execute a memory leak scenarios.

> Under the hood _fuite_ uses [Puppeteer](https://pptr.dev/) to control a Chrome instance. So scenarios must use Puppeteer API.

## Running test

To run the test, you will need to

1. Start JupyterLab after compiling it at a reference state with the following command

```
jupyter lab --config memory-leaks/jupyter_lab_config.py
```

2. Run the tests against the reference

```
cd memory-leaks
yarn install
yarn build
yarn test:mocha
```

3. Stop JupyterLab

The benchmark scenarios are:

- notebook: Create a new notebook and delete it (memory-leaks/tests/notebook.mjs).
- file-editor: Create a new text file (memory-leaks/tests/file-editor.mjs).
- cell:
  - Add a cell (for all 3 types) (memory-leaks/tests/cell.mjs)
  - Move a cell by drag-and-drop (for all 3 types) (memory-leaks/tests/cell-motion.mjs)

Each _fuite_ scenario is stored in a specific file and can be run separately
using:

```sh
npx fuite http://localhost:9999/lab?reset -s memory-leaks/tests/notebook.mjs
```

You can run in headless mode with the `-d` flag. And you can change the number
of iteration with `-i <number>` option.

> Don't forget the `?reset` query arguments to ensure the workspace is reset between each iteration.
