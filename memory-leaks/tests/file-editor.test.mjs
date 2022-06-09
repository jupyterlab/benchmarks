import { findLeaks } from "fuite";
import { expect } from "chai";
import { asyncIterableToArray, formatResult } from "./utils.mjs";
import * as scenario from "./file-editor.mjs";

const URL = process.env.TARGET_URL ?? "http://localhost:9999/lab?reset";

describe("File editor memory leaks", () => {
  it("Opening a text file", async () => {
    const results = await asyncIterableToArray(
      findLeaks(URL, {
        iterations: parseInt(process.env.MEMORY_LEAK_NSAMPLES ?? '7', 10),
        scenario,
      })
    );

    console.log(formatResult(results[0]));

    expect(results[0].result.leaks.detected).to.equal(false);
  });
});
