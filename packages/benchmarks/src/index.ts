/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import * as quantile from "@stdlib/stdlib/lib/node_modules/@stdlib/stats/base/dists/t/quantile";
import * as meanpw from "@stdlib/stdlib/lib/node_modules/@stdlib/stats/base/meanpw";
import * as variancepn from "@stdlib/stdlib/lib/node_modules/@stdlib/stats/base/variancepn";

/**
 * Quantifies the performance changes between two measures systems. Assumes we gathered
 * n independent measurement from each, and calculated their means and varience.
 *
 * Based on the work by Tomas Kalibera and Richard Jones. See their paper
 * "Quantifying Performance Changes with Effect Size Confidence Intervals", section 6.2,
 * formula "Quantifying Performance Change".
 *
 * However, it simplifies it to only assume one level of benchmarks, not multiple levels.
 * If you do have multiple levels, simply use the mean of the lower levels as your data,
 * like they do in the paper.
 *
 * @param oldSystem The old system we measured
 * @param newSystem The new system we measured
 * @param n The number of samples from each system (must be equal)
 * @param confidenceInterval The confidence interval for the results.
 *  The default is a 95% confidence interval (95% of the time the true mean will be
 *  between the resulting mean +- the resulting CI)
 */
export function performanceChange(
  { mean: y_o, variance: s_o }: { mean: number; variance: number },
  { mean: y_n, variance: s_n }: { mean: number; variance: number },
  n: number,
  confidenceInterval: number = 0.95
): { mean: number; confidenceInterval: number } {
  const dof = n - 1;
  const t = quantile(1 - (1 - confidenceInterval) / 2, dof);
  const oldFactor = sq(y_o) - (sq(t) * s_o) / n;
  const newFactor = sq(y_n) - (sq(t) * s_n) / n;
  const meanNum = y_o * y_n;
  const ciNum = Math.sqrt(sq(y_o * y_n) - newFactor * oldFactor);
  return {
    mean: meanNum / oldFactor,
    confidenceInterval: ciNum / oldFactor,
  };
}

/**
 * Compute the performance change based on a number of old and new measurements.
 */
export function performanceChangeFromData(
  old: number[],
  new_: number[],
  confidenceInterval: number = 0.95
): { mean: number; confidenceInterval: number } {
  const n = old.length;
  if (n !== new_.length) {
    throw new Error("Data have different length");
  }
  return performanceChange(
    { mean: mean(...old), variance: variance(...old) },
    { mean: mean(...new_), variance: variance(...new_) },
    n,
    confidenceInterval
  );
}

/**
 * Format a performance changes like `between 20.1% slower and 30.3% faster`
 */
export function formatChange({
  mean,
  confidenceInterval,
}: {
  mean: number;
  confidenceInterval: number;
}): string {
  return `between ${formatPercent(
    mean + confidenceInterval
  )} and ${formatPercent(mean - confidenceInterval)}`;
}

function formatPercent(percent: number): string {
  if (percent < 1) {
    return `${((1 - percent) * 100).toFixed(1)}% faster`;
  }
  return `${((percent - 1) * 100).toFixed(1)}% slower`;
}

function sq(x: number): number {
  return Math.pow(x, 2);
}

export function mean(...x: number[]): number {
  return meanpw(x.length, x, 1);
}

function variance(...x: number[]): number {
  return variancepn(x.length, 1, x, 1);
}
