import pytest
from playwright.sync_api import sync_playwright
from nbconvert.filters.markdown import markdown2html

from .utils import commonmark_gfm_tests, get_jupyterlab_rendered_markdown

counter = 0


def id_gfm_foo(test):
    global counter
    counter += 1
    return f"Test {counter} " + test.get("section", "")


@pytest.mark.parametrize("gfm", commonmark_gfm_tests(), ids=id_gfm_foo)
def test_nbconvert_jupyterlab(gfm):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://127.0.0.1:9999/")
        lab_html = page.evaluate(get_jupyterlab_rendered_markdown, gfm["markdown"])
        print(repr(gfm["markdown"]))
        assert lab_html == markdown2html(gfm["markdown"])
        browser.close()
