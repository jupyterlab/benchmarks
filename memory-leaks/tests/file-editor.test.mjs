import { testScenario } from "./utils.mjs";
import * as scenario from "./file-editor.mjs";

describe("# File editor memory leaks", () => {
  it("Opening a text file", async () => {
    await testScenario(scenario, { expectations: [{ objects: 456 }] });
  });
});
