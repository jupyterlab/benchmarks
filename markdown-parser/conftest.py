def pytest_addoption(parser):
    """Add option to set the comparison reports"""
    parser.addoption(
        "--report-dir",
        help="Directory in which the reports must be saved.",
    )
