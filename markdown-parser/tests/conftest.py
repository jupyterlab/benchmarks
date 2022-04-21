import os
import pathlib
import pytest
from playwright.sync_api import Error
from slugify import slugify


def _build_artifact_test_folder(pytestconfig, request, folder_or_file_name):
    # Taken from pytest-playwright
    output_dir = pytestconfig.getoption("--output")
    return os.path.join(output_dir, slugify(request.node.nodeid), folder_or_file_name)


@pytest.fixture(scope="session")
def jupyterlab_page(browser, browser_context_args, pytestconfig, request):
    # Merge pytest-playwright fixtures context and page at scope session and load the JupyterLab page
    pages = []
    context = browser.new_context(**browser_context_args)
    context.on("page", lambda page: pages.append(page))

    tracing_option = pytestconfig.getoption("--tracing")
    capture_trace = tracing_option in ["on", "retain-on-failure"]
    if capture_trace:
        context.tracing.start(
            name=slugify(request.node.nodeid),
            screenshots=True,
            snapshots=True,
            sources=True,
        )

    page = context.new_page()
    page.goto("/lab")
    yield page

    # If request.node is missing rep_call, then some error happened during execution
    # that prevented teardown, but should still be counted as a failure
    failed = request.node.rep_call.failed if hasattr(request.node, "rep_call") else True

    if capture_trace:
        retain_trace = tracing_option == "on" or (
            failed and tracing_option == "retain-on-failure"
        )
        if retain_trace:
            trace_path = _build_artifact_test_folder(pytestconfig, request, "trace.zip")
            context.tracing.stop(path=trace_path)
        else:
            context.tracing.stop()

    screenshot_option = pytestconfig.getoption("--screenshot")
    capture_screenshot = screenshot_option == "on" or (
        failed and screenshot_option == "only-on-failure"
    )
    if capture_screenshot:
        for index, page in enumerate(pages):
            human_readable_status = "failed" if failed else "finished"
            screenshot_path = _build_artifact_test_folder(
                pytestconfig, request, f"test-{human_readable_status}-{index+1}.png"
            )
            try:
                page.screenshot(timeout=5000, path=screenshot_path)
            except Error:
                pass

    context.close()

    video_option = pytestconfig.getoption("--video")
    preserve_video = video_option == "on" or (
        failed and video_option == "retain-on-failure"
    )
    if preserve_video:
        for page in pages:
            video = page.video
            if not video:
                continue
            try:
                video_path = video.path()
                file_name = os.path.basename(video_path)
                video.save_as(
                    path=_build_artifact_test_folder(pytestconfig, request, file_name)
                )
            except Error:
                # Silent catch empty videos.
                pass


def pytest_addoption(parser):
    """Add option to set the comparison reports"""
    parser.addoption(
        "--report-dir",
        help="Directory in which the reports must be saved.",
    )


@pytest.fixture(scope="module")
def md_report(request):
    """Generate a comparison report for each test module.
    
    Each test must return a dictionary with the same keys. Each keys will be
    a table header and each test will be a table row.
    """
    test_reports = []

    yield test_reports

    if len(test_reports[0]) > 0:
        filename = pathlib.Path(request.config.getoption("report_dir")) / (
            request.module.__name__.replace(".", "_") + "_report.md"
        )

        with filename.open("w") as f:
            headers = test_reports[0]
            f.writelines(
                [
                    f"# {request.module.__name__}\n",
                    "\n",
                    "| " + " | ".join(headers) + " |\n",
                    "| " + " | ".join(["---"] * len(headers)) + " |\n",
                ]
            )
            f.writelines(
                map(
                    lambda e: "| " + " | ".join(map(str, e.values())) + " |\n",
                    test_reports,
                )
            )
