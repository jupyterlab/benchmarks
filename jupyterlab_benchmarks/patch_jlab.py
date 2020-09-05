# Local imports
import json
import os

# Constants
JLAB_HOME = os.environ.get("JLAB_HOME")

# Paths
HERE = os.path.abspath(os.path.dirname(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(HERE))
PACKAGE_JSON = os.path.join(JLAB_HOME, "dev_mode", "package.json")
FDT_EXTENSION = os.path.join(REPO_ROOT, "extensions", "fixed-data-table")
EXTENSIONS = {
    "plotlywidget": "1.5.4",
    "jupyterlab-plotly": "1.5.4",
    "fdtmime": FDT_EXTENSION,
}


def main():
    with open(PACKAGE_JSON, "r") as fh:
        data = json.loads(fh.read())

    current_extensions = data["jupyterlab"]["externalExtensions"]
    current_extensions.update(EXTENSIONS)
    data["jupyterlab"]["externalExtensions"] = current_extensions
    print(json.dumps(data, indent=4, sort_keys=True))

    with open(PACKAGE_JSON, "w") as fh:
        fh.write(json.dumps(data, indent=4, sort_keys=True))


if __name__ == "__main__":
    main()
