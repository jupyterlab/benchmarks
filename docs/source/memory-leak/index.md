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
yarn start-jlab &
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

You can run in headed mode with the `-d` flag. And you can change the number
of iteration with `-i <number>` option.

> Don't forget the `?reset` query arguments to ensure the workspace is reset between each iteration.

## Finding leaks

From the direct report of `fuite`, you may have stack trace to look at for growing collections. But
may not be sufficient to find all leaks. For that, you can use the 
[three heap snapshot technique](https://docs.google.com/presentation/d/1wUVmf78gG-ra5aOxvTfYdiLkdGaR9OhXRnOlIcEmu2s)
introduced by the GMail team. The steps to carry out are:

1. Take a heap snapshot
2. Do some actions that are creating memory leaks; e.g. opening and closing a new notebook.
3. Take a second heap snapshot
4. Do the same actions as in step _2_; e.g. opening and closing a new notebook.
5. Take a third heap snapshot
6. Assuming you are using Chrome-based browser, filter the objects to those allocated between
   snapshots 1 and 2 in snapshot 3's _Summary_ view.

This will grant you access to objects leaking in memory. From there:

- Examine the retaining path of leaked objects in the lower half of the Profiles panel

- If the allocation site cannot be easily inferred (i.e. event listeners):
  - Instrument the constructor of the retaining object via the JS console to save the stack trace for allocations
    Gmail team proposed the following snippet:
    ```js
    window.__save_el = goog.events.Listener
    goog.events.Listener = function () { this._stack = new Error().stack;}
    goog.events.Listener.prototype = window.__save_el.prototype
    ```
  - Rerun the scenario
  - Expand objects in the retaining tree to see the stack trace: `$0._stack`

- Fix it!
  - Properly dispose of the retaining object
  - unlisten() to event listeners
