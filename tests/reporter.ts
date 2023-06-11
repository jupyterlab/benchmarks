import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import * as fs from "fs";

import { summary, notice, error } from "@actions/core";

import type { IBenchmarkResult } from "@jupyterlab/ui-profiler";

// TODO: use `Statistic` from ui-profiler?
namespace Statistic {
  export function mean(numbers: number[]): number {
    if (numbers.length === 0) {
      return NaN;
    }
    return sum(numbers) / numbers.length;
  }

  export function round(n: number, precision = 0): number {
    const factor = Math.pow(10, precision);
    return Math.round(n * factor) / factor;
  }

  export function sum(numbers: number[]): number {
    if (numbers.length === 0) {
      return 0;
    }
    return numbers.reduce((a, b) => a + b);
  }

  /**
   * Implements corrected sample standard deviation.
   */
  export function standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) {
      return NaN;
    }
    const m = mean(numbers);
    return Math.sqrt(
      (sum(numbers.map((n) => Math.pow(n - m, 2))) * 1) / (numbers.length - 1)
    );
  }
}

interface IAttachment extends IBenchmarkResult {
  reference: string;
  granular?: boolean;
  backgroundTab: string;
  name: string;
}

class UIProfilerReporter implements Reporter {
  constructor(options: {}) {}
  private _attachments: IAttachment[] = [];
  private _reference: string = "unknown";

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Starting test ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`Finished test ${test.title}: ${result.status}`);
    if (result.status !== "passed") {
      return;
    }
    const attachments = result.attachments
      .map((raw) => {
        const json = JSON.parse(
          raw.body?.toString() ?? "{}"
        ) as any as IAttachment;
        return { ...json, name: raw.name };
      })
      .filter((a) => !a.granular && a.reference);

    for (const attachment of attachments) {
      this._attachments.push(attachment);
      notice(
        attachment.benchmark +
          " of " +
          attachment.scenario +
          " completed in " +
          attachment.outcome.totalTime / 1000 +
          "s"
      );
    }
  }

  async onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);

    const dir = "results";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const references = new Set<string>();
    for (const attachment of this._attachments) {
      // `uploadArtifact` forbids colons in file names
      const path = attachment.name.replace(":", "_");
      fs.writeFileSync(dir + "/" + path, JSON.stringify(attachment));
      references.add(attachment.reference);
    }
    if (references.size > 1) {
      throw new Error("More than one reference versions is not supported");
    } else if (references.size == 0) {
      throw new Error("No results to report");
    }
    const reference = references.values().next().value;
    this._reference = reference;

    // Add summary table showing average execution time per scenario (rows) per notebook (columns)
    summary.addHeading(this._reference);

    const timeMeasurements = this._attachments.filter(
      (a) => a.benchmark === "execution-time"
    );
    const scenarios = [...new Set(timeMeasurements.map((a) => a.scenario))];
    const backgrounds = [
      ...new Set(timeMeasurements.map((a) => a.backgroundTab)),
    ];

    summary.addTable([
      [
        { data: "scenario", header: true },
        ...backgrounds.map((b) => {
          return { data: b, header: true };
        }),
      ],
      ...scenarios.map((s) => {
        const row = backgrounds.map((b) => {
          const result = this._attachments.find(
            (a) => a.backgroundTab === b && a.scenario === s
          );
          const times = result.outcome.results[0].times;
          return (
            Statistic.round(Statistic.mean(times), 2).toString() +
            " ± " +
            Statistic.round(Statistic.standardDeviation(times), 2).toString()
          );
        });
        return [s, ...row];
      }),
    ]);
    await summary.write();
  }

  printsToStdio() {
    return false;
  }
}

export default UIProfilerReporter;
