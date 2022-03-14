import { galata } from "@jupyterlab/galata";

const NLINES = Number(process.env['LARGE_METADATA'] || 1000);

export default {
  label: `large_metadata_${NLINES}x{N}_notebook`,
  waitFor: () => Promise.resolve(void 0),
  notebook: (n: number = 300) => {
    const nb = galata.Notebook.makeNotebook([
      galata.Notebook.makeCell({
        cell_type: "markdown",
        source: ["Notebook with very large metadata"],
      }),
    ]);
    nb.metadata["dummyData"] = new Array(n * NLINES).fill(
      "very long string of nothing interesting to say about the emptiness of the void"
    );

    return nb;
  },
};
