import pytest
from nbconvert.filters.markdown import markdown2html_mistune

from .utils import commonmark_gfm_tests


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_gfm_nbconvert_markdown2html(md_report, gfm):

    # Import normalize helper from github/cmark-gfm through its addition to sys.path in commonmark_gfm_tests
    from normalize import normalize_html

    given = gfm["markdown"]
    test = normalize_html(markdown2html_mistune(given))
    ref = normalize_html(gfm["html"])

    success = True
    try:
        assert test == ref
    except Exception as e:
        success = False
        raise e
    finally:
        md_report.append(
            {
                "id": gfm["example"],
                "section": gfm["section"],
                "failed": "" if success else "X",
                "markdown": repr(given).replace("'", "`"),
                "commonmark-gfm": repr(ref).replace("'", "`"),
                "nbconvert - mistune": repr(test).replace("'", "`"),
                "comments": "",
            }
        )
