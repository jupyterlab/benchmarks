"""Notebook generation code (this shows the issue even if you don't have a Table render)
"""

import json
import random

import nbformat
from nbconvert.preprocessors import ExecutePreprocessor


NUM_CELLS = 1000
CODE_CELL_RATIO = 0.9
LOC_PER_CELL = 2
FDT_PER_CODE_CELL =  0.5
TABLE_SIZE = (2000, 10)  # 2k rows, 10 col
CHART_DATAPOINTS = 1000
STDOUT_PER_CODE_CELL = 0.1


random.seed(0)

def create():
    nb = nbformat.v4.new_notebook()
    nb.metadata.kernelspec = {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3",
    }

    cells = []
    cells.append(nbformat.v4.new_code_cell('\n'.join(["# any import",
                                            '''# FDT (jupyter benchmarks)
from IPython.display import display
def Table(data=''):
    bundle = {}
    bundle['text/csv'] = data
    display(bundle, raw=True)
                                            '''])))
    
    for i in range(NUM_CELLS - 1):
        if random.random() > CODE_CELL_RATIO:
            cell = nbformat.v4.new_markdown_cell("### I am cell {}".format(i))
        else:
            loc = 0
            code = []
            if random.random() < STDOUT_PER_CODE_CELL:
                code.append("print({})".format(i))
                loc += 1
            if loc < LOC_PER_CELL:
                code = code + [
                    "x = {}".format(i + l) for l in range(LOC_PER_CELL - loc)
                ]
            cell = nbformat.v4.new_code_cell("\n".join(code))
            if random.random() < FDT_PER_CODE_CELL:
                code.append(
                    ''
                     "Table('\\n'.join(';'.join([str(y) for y in range({})]) for x in range({})))".format(
                         TABLE_SIZE[1], TABLE_SIZE[0]
                     )
                )
                loc += 1
        cells.append(cell)

    nb.cells = cells
    # TODO: If we want this to be more random, randomize the genreated cells
    return nb


def run(nb):
    ep = ExecutePreprocessor(timeout=600, kernel_name="python3")
    ep.preprocess(nb, {"metadata": {"path": "./"}})
    return nb


nb = run(create())

# Remember, you can't see the output here till you "trust" the notebook
with open(
    "generated-{}cells-{}ratio-{}loc.ipynb".format(
        NUM_CELLS, CODE_CELL_RATIO, LOC_PER_CELL
    ),
    "w",
) as f:
    f.write(json.dumps(nb, indent=4))
