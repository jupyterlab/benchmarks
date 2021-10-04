import makeNotebook from "./../makeNotebook";

export default {
  label: "large_md_300_notebook",
  waitFor: () => Promise.resolve(void 0),
  notebook: (n: number) => {
    const cells = [];
    for (let i = 0; i < 300; ++i) {
      cells.push({
        cell_type: "markdown",
        metadata: {},
        source: [
            '# Demonstration of proper behaviour with non-LaTeX uses of `$`\n',
            '\n',
            '## This should be highlighted as a heading\n',
            '\n',
            'Sample code:\n',
            '\n',
            '    ```\n',
            '    echo $HOME\n',
            '    ```\n',
            '\n',
            '```shell\n',
            'echo $HOME\n',
            '```\n',
            '\n',
            'The code block below should be properly highlighted:\n',
            '\n',
            '```bash\n',
            'echo $HOME\n',
            '```\n',
            '\n',
            '\n',
            '### Heading\n',
            '\n',
            '`$test`\n',
            '\n',
            '### This heading should be highlighted too'
          ],
      });
    }

    return makeNotebook(cells);
  },
};
