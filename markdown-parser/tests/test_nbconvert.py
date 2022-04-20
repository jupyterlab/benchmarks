import pytest
from nbconvert.filters.markdown import markdown2html

from .utils import commonmark_gfm_tests


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_gfm_nbconvert_markdown2html(gfm):
    print(repr(gfm["markdown"]))
    assert markdown2html(gfm["markdown"]).replace('\n', '') == gfm["html"].replace('\n', '')
