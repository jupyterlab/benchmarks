import { galata } from "@jupyterlab/galata";

export default {
  label: "large_code_{N}_notebook",
  waitFor: () => Promise.resolve(void 0),
  notebook: (n: number = 300) => {
    return galata.Notebook.generateNotebook(n, "code", [
      "OUTPUT_LENGTH = 300\n",
      "PREFIX = '''\n",
      "This is line of long text that is intended to fill up the screen;\n",
      "it does not contain any meaningful information for but sure does occupy a lot of space.\n",
      "'''\n",
      "\n",
      "for x in range(OUTPUT_LENGTH):\n",
      '    print(f"{PREFIX} {x}")',
    ]);
  },
};
