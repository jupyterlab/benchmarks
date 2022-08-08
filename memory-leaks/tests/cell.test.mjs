import { testScenario } from "./utils.mjs";
import * as addScenario from "./cell.mjs";
import * as moveScenario from "./cell-motion.mjs";

describe("# Cell memory leaks", () => {
  it("Adding a cell", async () => {
    await testScenario(addScenario, {
      expectations: [
        // Code cell
        { objects: 1400, collections: 32 },
        // Markdown cell
        { objects: 1365, collections: 54 },
        // Raw cell
        { objects: 1046, collections: 54 },
      ],
    });
  });

  it("Drag and drop a cell", async () => {
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
