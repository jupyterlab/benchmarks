import pytest
from playwright.sync_api import sync_playwright
from nbconvert.filters.markdown import markdown2html

from .utils import commonmark_gfm_tests, get_jupyterlab_rendered_markdown


@pytest.mark.parametrize("gfm", commonmark_gfm_tests())
def test_nbconvert_jupyterlab(jupyterlab_page, gfm):
    lab_html = jupyterlab_page.evaluate(get_jupyterlab_rendered_markdown, gfm["markdown"])
    print(repr(gfm["markdown"]))
    assert lab_html == markdown2html(gfm["markdown"])
