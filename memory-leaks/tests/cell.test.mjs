import { findLeaks } from "fuite";
import { expect } from "chai";
import { asyncIterableToArray, formatResult } from "./utils.mjs";
import * as scenario from "./cell.mjs";

const URL = process.env.TARGET_URL ?? "http://localhost:9999/lab?reset";

describe("Cell memory leaks", () => {
  it("Adding a cell", async () => {
    const results = await asyncIterableToArray(
      findLeaks(URL, {
        iterations: parseInt(process.env.MEMORY_LEAK_NSAMPLES ?? "7", 10),
        scenario,
      })
    );

    results.forEach((r) => {
      console.log(formatResult(r));
    });

    expect(results.map((r) => r.result.leaks.detected)).to.deep.equal([
      false,
      false,
      false,
    ]);
  });
});
