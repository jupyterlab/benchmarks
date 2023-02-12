import { expect } from "chai";
import { findLeaks } from "fuite";
import prettyBytes from "pretty-bytes";

export const ITERATIONS = parseInt(process.env.MEMORY_LEAK_NSAMPLES ?? "7", 10);

export const URL = process.env.TARGET_URL ?? "http://localhost:9999/lab?reset";

export async function asyncIterableToArray(iterable) {
  const res = [];
  for await (const item of iterable) {
    res.push(item);
  }
  return res;
}

/**
 * Check a scenario is not leaking outside the default values.
 *
 * @param {*} results Fuite test results
 * @param {*} defaultValues Default maximal leaking number for 'objects', 'collections', 'domNodes' and 'eventListeners' per tests
 */
function expectNoLeaks(results, defaultValues = []) {
  results.forEach((test) => {
    console.log(formatResultAsMarkdown(test));
  });

  results.forEach((test, idx) => {
    const expectations = defaultValues[idx] ?? {};

    expect(
      test.result.leaks.detected
    ).to.equal(expectations.leak ?? false);

    expect(
      test.result.leaks.objects
        .map((obj) => obj.countDeltaPerIteration)
        .reduce((agg, count) => agg + count, 0),
      `${test.test.description} - Objects leaking`
    ).to.be.at.most(expectations.objects ?? 0);
    expect(
      test.result.leaks.collections
        .map((collection) => collection.deltaPerIteration)
        .reduce((agg, count) => agg + count, 0),
      `${test.test.description} - Collections leaking`
    ).to.be.at.most(expectations.collections ?? 0);
    expect(
      test.result.leaks.domNodes.deltaPerIteration,
      `${test.test.description} - DOM Nodes leaking`
    ).to.be.at.most(expectations.domNodes ?? 0);
    expect(
      test.result.leaks.eventListenersSummary.deltaPerIteration,
      `${test.test.description} - Event listeners leaking`
    ).to.be.at.most(expectations.eventListeners ?? 0);
  });
}

function formatStacktraces(stacktraces) {
  if (!stacktraces || !stacktraces.length) {
    return "";
  }
  // just show a preview of the stacktraces, the first one is good enough
  const [stacktrace] = stacktraces;
  const { original, pretty } = stacktrace;
  const repr = pretty || original || "";
  let str = `<pre>${repr
    .replace(/</g, "\\<")
    .replace(/\n/g, "<br />")}</pre>`;
  return str;
}

function arrayToRow(array, isHeader = false) {
  let row = "| " + array.join(" | ") + " |\n";
  if (isHeader) {
    row += arrayToRow(new Array(array.length).fill("---"));
  }
  return row;
}

function formatLeakingObjects(objects) {
  let str = arrayToRow(["Object", "# added", "Retained size increase"], true);

  for (const {
    name,
    retainedSizeDeltaPerIteration,
    countDeltaPerIteration,
  } of objects) {
    str += arrayToRow([
      name,
      countDeltaPerIteration,
      "+" + prettyBytes(retainedSizeDeltaPerIteration),
    ]);
  }
  return `\nLeaking objects:\n\n${str}\n\n`;
}

function formatLeakingEventListeners(listenerSummaries, eventListenersSummary) {
  let str = arrayToRow(["Event", "# added", "Nodes"], true);
  let hasIndividualBreakdowns = false;

  for (const { type, deltaPerIteration, leakingNodes } of listenerSummaries) {
    hasIndividualBreakdowns = true;
    const nodesFormatted = leakingNodes
      .map(({ description, nodeCountDeltaPerIteration }) => {
        return `${description}${
          nodeCountDeltaPerIteration !== 0
            ? ` (+${nodeCountDeltaPerIteration})`
            : ""
        }`;
      })
      .join(", ");
    str += arrayToRow([type, deltaPerIteration, nodesFormatted]);
  }

  if (hasIndividualBreakdowns) {
    // no individual breakdowns, so just put the total
    str += arrayToRow([
      "Total",
      eventListenersSummary.deltaPerIteration,
      "(Unknown)",
    ]);
  }

  return `\nLeaking event listeners (+${eventListenersSummary.deltaPerIteration} total):\n\n${str}\n\n`;
}

function formatLeakingDomNodes(domNodes) {
  let str = arrayToRow(["Description", "# added"], true);
  let hasBreakdowns = false;

  for (const { description, deltaPerIteration } of domNodes.nodes) {
    hasBreakdowns = true;
    str += arrayToRow([description, deltaPerIteration]);
  }

  if (hasBreakdowns) {
    // no individual breakdowns, so just put the total
    str += arrayToRow(["Total", domNodes.deltaPerIteration]);
  }

  return `\nLeaking DOM nodes (+${domNodes.deltaPerIteration} total):\n\n${str}\n\n`;
}

function formatLeakingCollections(leakingCollections) {
  let str = arrayToRow(
    ["Type", "Change", "Preview", "Size increased at"],
    true
  );

  for (const {
    type,
    deltaPerIteration,
    preview,
    stacktraces,
  } of leakingCollections) {
    str += arrayToRow([
      type,
      `+${deltaPerIteration}`,
      preview,
      formatStacktraces(stacktraces),
    ]);
  }
  return `\nLeaking collections:\n\n${str}\n\n`;
}

export function formatResultAsMarkdown({ test, result }) {
  let str = "";

  str += `<details><summary>${test.description}</summary>\n`;

  if (result.failed) {
    str += `Failed       : ${result.error.message}\n${result.error.stack}\n`;
    return str;
  }

  let leakTables = "";
  if (result.leaks.objects.length) {
    leakTables += formatLeakingObjects(result.leaks.objects);
  }
  if (result.leaks.eventListenersSummary.delta > 0) {
    leakTables += formatLeakingEventListeners(
      result.leaks.eventListeners,
      result.leaks.eventListenersSummary
    );
  }
  if (result.leaks.domNodes.delta > 0) {
    leakTables += formatLeakingDomNodes(result.leaks.domNodes);
  }
  if (result.leaks.collections.length) {
    leakTables += formatLeakingCollections(result.leaks.collections);
  }

  let snapshots = "";
  if (result.before.heapsnapshot && result.after.heapsnapshot) {
    snapshots = `\n\nBefore: ${result.before.heapsnapshot} (${prettyBytes(
      result.before.statistics.total
    )})\nAfter : ${result.after.heapsnapshot} (${prettyBytes(
      result.after.statistics.total
    )}) (${result.numIterations} iterations)\n`.trim();
  }

  str += `\nMemory change: ${
    result.deltaPerIteration > 0
      ? "+" + prettyBytes(result.deltaPerIteration)
      : prettyBytes(result.deltaPerIteration)
  }\nLeak detected: ${
    result.leaks.detected ? "Yes" : "No"
  }\n\n${leakTables}\n${snapshots}\n</details>`.trim();

  return str;
}

/**
 * Test a scenario for memory leaks
 *
 * @param {*} scenario Scenario to test
 * @param {*} options Scenario options: 'iterations', 'expectations'
 */
export async function testScenario(scenario, options = {}) {
  const results = await asyncIterableToArray(
    findLeaks(URL, {
      iterations: options.iterations ?? ITERATIONS,
      scenario,
    })
  );

  expectNoLeaks(results, options.expectations ?? []);
}
