import makeNotebook from "./../makeNotebook";

export default {
  label: "large_code_300_notebook",
  waitFor: () => Promise.resolve(void 0),
  notebook: (n: number) => {
    const cells = [];
    for (let i = 0; i < 300; ++i) {
      cells.push({
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "for x in range(OUTPUT_LENGTH):\n",
          '    print(f"{PREFIX} {x}")',
        ],
      });
    }

    return makeNotebook(cells);
  },
};
