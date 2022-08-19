import { galata } from "@jupyterlab/galata";

export default {
  label: "large_md_{N}_notebook",
  waitFor: ({ widgetID, page }) =>
    page.waitForSelector(
      `#${widgetID} >> text=The code block below should be properly highlighted:`
    ),
  notebook: (n: number = 300) => {
    return galata.Notebook.generateNotebook(n, "markdown", [
      "# Demonstration of proper behaviour with non-LaTeX uses of `$`\n",
      "\n",
      "## This should be highlighted as a heading\n",
      "\n",
      "Sample code:\n",
      "\n",
      "    ```\n",
      "    echo $HOME\n",
      "    ```\n",
      "\n",
      "```shell\n",
      "echo $HOME\n",
      "```\n",
      "\n",
      "The code block below should be properly highlighted:\n",
      "\n",
      "```bash\n",
      "echo $HOME\n",
      "```\n",
      "\n",
      "\n",
      "### Heading\n",
      "\n",
      "`$test`\n",
      "\n",
      "### This heading should be highlighted too",
    ]);
  },
  search: "echo",
};
