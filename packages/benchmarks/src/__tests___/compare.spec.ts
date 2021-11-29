/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import * as quantile from "@stdlib/stdlib/lib/node_modules/@stdlib/stats/base/dists/t/quantile";
import { mean, performanceChange, performanceChangeFromData } from "../index";

/**
 * Reproduce examples from paper, and verify we have implemented things correctly.
 */
describe("@jupyterlab/benchmarks", () => {
  const paperResult = {
    mean: 68.3 / 74.5,
    confidenceInterval: 60.2 / 74.5,
  };
  describe("quantile", () => {
    it("should be about equal", () => {
      expect(
        () => assertAboutEqual(quantile(1 - 0.05 / 2, 2), 4.3, "quantile")
      ).not.toThrow();
    });
  });

  describe("performanceChange", () => {
    it("should match the paper results", () => {
      expect(
        () => assertResultsEqual(
          performanceChange(
            { variance: 5.8, mean: 10.5 },
            { variance: 4.6, mean: 6.5 },
            3,
            0.95
          ),
          paperResult,
          "performanceChange"
        )
      ).not.toThrow();
    });
  });

  describe("performanceChangeFromData", () => {
    it("should match the paper results", () => {
      //   Data from table V, uses means of top level
      expect(
        () => assertResultsEqual(
          performanceChangeFromData(
            [mean(9, 11, 5, 6), mean(16, 13, 12, 8), mean(15, 7, 10, 14)],
            [mean(10, 12, 6, 7), mean(9, 1, 11, 4), mean(8, 5, 3, 2)],
            0.95
          ),
          paperResult,
          "performanceChangeFromData"
        )
      ).not.toThrow();
    });
  });
});

function assertResultsEqual(
  l: {
    mean: number;
    confidenceInterval: number;
  },
  r: { mean: number; confidenceInterval: number },
  message: string
) {
  assertAboutEqual(l.mean, r.mean, `${message}: means`);
  assertAboutEqual(
    l.confidenceInterval,
    r.confidenceInterval,
    `${message}: confidence interval`
  );
}

function assertAboutEqual(x: number, y: number, msg: string): void {
  if (Math.abs(x - y) > 0.005) throw new Error(`${msg}: ${x} != ${y}`);
}
