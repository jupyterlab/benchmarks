import pytest
from nbconvert.filters.markdown import markdown2html_mistune

from .utils import commonmark_gfm_tests, get_jupyterlab_rendered_markdown


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_nbconvert_jupyterlab(jupyterlab_page, md_report, gfm):
    given = gfm["markdown"]
    test = markdown2html_mistune(given)
    ref = jupyterlab_page.evaluate(get_jupyterlab_rendered_markdown, gfm["markdown"])

    success = True
    try:
        assert test == ref
    except Exception as e:
        success = False
        raise e
    finally:
        md_report.append({
            "id": gfm["example"],
            "section": gfm["section"],
            "failed": "" if success else "X",
            "markdown": repr(given).replace("'", "`"),
            "JupyterLab": repr(ref).replace("'", "`"),
            "nbconvert - mistune": repr(test).replace("'", "`"),
            "comments": ""
        })
