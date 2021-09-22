import { galata } from "@jupyterlab/galata";

export default {
    label: 'large_code_{N}_notebook',
    waitFor: () => Promise.resolve(void 0),
    notebook: (n: number = 300) => {
        return galata.Notebook.generateNotebook(n, 'code', [
            'for x in range(OUTPUT_LENGTH):\n',
            '    print(f"{PREFIX} {x}")'
          ]);
    }
}