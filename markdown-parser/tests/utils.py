import functools
from pathlib import Path
import sys
import tempfile
import zipfile
import requests

# Commonmark GitHub flavored project
COMMONMARK_GFM_URL = "https://github.com/github/cmark-gfm/archive/refs/heads/master.zip"
SPEC_EXTRACTOR = "cmark-gfm-master/test/spec_tests.py"
SPEC_FILES = ["spec.txt"]


@functools.lru_cache(1)
def commonmark_gfm_tests():
    tests = []
    r = requests.get(COMMONMARK_GFM_URL)

    with tempfile.TemporaryDirectory() as tmpdir:
        with tempfile.NamedTemporaryFile(mode="wb", suffix=".zip") as tfile:
            tfile.write(r.content)

            with zipfile.ZipFile(tfile.name, mode="r") as fzip:
                fzip.extractall(tmpdir)

        tmp_path = Path(tmpdir)
        test_folder = (tmp_path / SPEC_EXTRACTOR).parent

        sys.path.insert(0, str(test_folder))

        from spec_tests import get_tests

        for testfile in SPEC_FILES:
            tests.extend(get_tests(str(test_folder / testfile)))

        sys.path.remove(str(test_folder))

    return tests

# Javascript function to render a markdown string `md`
# to HTML using the JupyterLab parser.
get_jupyterlab_rendered_markdown = """async (md) => {
    const app = window.jupyterlab ?? window.jupyterapp;

    const pluginId = '@jupyterlab/rendermime-extension:plugin';

    const plugin = app._pluginMap[pluginId];

    if (!plugin.activated) {
        await app.activatePlugin(pluginId);
    }

    const renderer = plugin.service.createRenderer('text/markdown');
    await renderer.renderModel(
        plugin.service.createModel({ data: { 'text/markdown': md } })
    );

    return renderer.node.innerHTML;
}"""
