import { testScenario } from "./utils.mjs";
import * as addScenario from "./cell.mjs";
import * as moveScenario from "./cell-motion.mjs";

describe("# Cell memory leaks", () => {
  it("Adding a cell", async () => {
    await testScenario(addScenario, {
      expectations: [
        // Code cell
        { leak: true, objects: 1283, collections: 18 },
        // Markdown cell
        { leak: true, objects: 867, collections: 28 },
        // Raw cell
        { leak: true, objects: 548, collections: 28 },
      ],
    });
  });

  // Currently (as of 2022.09.22) the move cell in JupyterLab is
  // not a move motion but a delete-insert action as YJs version
  // supporting motion is not yet used.
  it.skip("Drag and drop a cell", async () => {
    await testScenario(moveScenario, {
      expectations: [
        // Code cell
        { objects: 162, collections: 24 },
        // Markdown cell
        { objects: 144, collections: 20 },
        // Raw cell
        { objects: 102, collections: 20 },
      ],
    });
  });
});
