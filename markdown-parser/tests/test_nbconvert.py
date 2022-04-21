import pytest
from nbconvert.filters.markdown import markdown2html_mistune

from .utils import commonmark_gfm_tests


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_gfm_nbconvert_markdown2html(md_report, gfm):
    given = gfm["markdown"]
    test = markdown2html_mistune(given)
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
            "nbconvert - mistune": repr(test).replace("'", "`"),
            "comments": ""
        })
