"""package setup."""
from setuptools import setup

setup(
    name="jupyterlab-benchmarks",
    version="0.2.0",
    description=(
        "Benchmarking tools for JupyterLab."
    ),
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/jupyterlab/benchmarks",
    project_urls={"Documentation": "https://jupyterlab-benchmarks.readthedocs.io"},
    license="MIT",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    keywords="jupyterlab benchmarks",
    python_requires=">=3.6",
    install_requires=[
    ],
    extras_require={
        "sphinx": [],
        "code_style": [
            "flake8<3.8.0,>=3.7.0", 
            "black", 
            "pre-commit==1.17.0"
        ],
        "testing": [
        ],
        # Note: This is only required for internal use
        "rtd": [
            "matplotlib",
            "myst_parser",
            "myst-nb",
            "notebook",
            "jupytext",
            "pandas",
            "altair",
            "vega",
            "pyyaml",
            "docutils>=0.15",
            "sphinx",
            "sphinxcontrib-bibtex",
            "sphinxcontrib-mermaid",
            "ipython",
            "sphinx-book-theme",
            "sphinx_tabs"
        ],
    },
    zip_safe=True,
)