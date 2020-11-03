"""myst-parser package setup."""
from importlib import import_module

from setuptools import find_packages, setup

setup(
    name="jupyterlab-benchmarks",
    version=import_module("jupyterlab_benchmarks").__version__,
    description=(
        "Benchmarking tools for JupyterLab."
    ),
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/jupyterlab/benchmarks",
    project_urls={"Documentation": "https://jupyterlab-benchmarks.readthedocs.io"},
    license="MIT",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
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