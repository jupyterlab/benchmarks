import pytest
from nbconvert.filters.markdown import markdown2html

from .utils import commonmark_gfm_tests

counter = 0


def id_gfm_foo(test):
    global counter
    counter += 1
    return f"Test {counter} " + test.get("section", "")


@pytest.mark.parametrize("gfm", commonmark_gfm_tests(), ids=id_gfm_foo)
def test_gfm_nbconvert_markdown2html(gfm):
    print(repr(gfm["markdown"]))
    assert markdown2html(gfm["markdown"]).replace('\n', '') == gfm["html"].replace('\n', '')
