import { findLeaks } from "fuite";
import { expect } from "chai";
import { asyncIterableToArray, formatResult } from "./utils.mjs";
import * as notebookScenario from "./notebook.mjs";

const URL = process.env.TARGET_URL ?? "http://localhost:9999/lab";

describe("Notebook memory leaks", () => {
  it("Opening a notebook", async () => {
    const results = await asyncIterableToArray(
      findLeaks(URL, {
        iterations: parseInt(process.env.MEMORY_LEAK_NSAMPLES ?? '7', 10),
        scenario: notebookScenario,
      })
    );

    console.log(formatResult(results[0]));

    expect(results[0].result.leaks.detected).to.equal(false);
  });
});
