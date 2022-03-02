import { galata } from "@jupyterlab/galata";

export default {
  label: "large_metadata_1e4x{N}_notebook",
  waitFor: () => Promise.resolve(void 0),
  notebook: (n: number = 300) => {
    const nb = galata.Notebook.makeNotebook([galata.Notebook.makeCell({})]);
    nb.metadata["dummyData"] = new Array(n * 10000).fill(
      "very long string of nothing interesting to say about the emptiness of the void"
    );

    return nb;
  },
};
