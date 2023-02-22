import { testScenario } from "./utils.mjs";
import * as notebookScenario from "./notebook.mjs";

describe("# Notebook memory leaks", () => {
  it("Opening a notebook", async () => {
    await testScenario(notebookScenario, {
      expectations: [{ leak: true, collections: 8, objects: 639 }],
    });
  });
});
