import pytest

from .utils import commonmark_gfm_tests, get_jupyterlab_rendered_markdown


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_gfm_jupyterlab_renderer(jupyterlab_page, md_report, gfm):
    given = gfm["markdown"]
    test = jupyterlab_page.evaluate(get_jupyterlab_rendered_markdown, gfm["markdown"])
    ref = gfm["html"]

    success = True
    try:
        assert test.replace('\n', '') == ref.replace('\n', '')
    except Exception as e:
        success = False
        raise e
    finally:
        md_report.append({
            "id": gfm["example"],
            "section": gfm["section"],
            "failed": "" if success else "X",
            "markdown": repr(given).replace("'", "`"),
            "commonmark-gfm": repr(ref).replace("'", "`"),
            "JupyterLab": repr(test).replace("'", "`"),
            "comments": ""
        })
