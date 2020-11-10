# Local imports
import json
import os

# Paths
JLAB_ROOT = os.getcwd()
PACKAGE_JSON = os.path.join(JLAB_ROOT, "dev_mode", "package.json")
EXTERNAL_DEPENDENCIES = {
    "@jupyterlab-benchmarks/table-render": "0.1.1"
}


def main():
    with open(PACKAGE_JSON, "r") as fh:
        data = json.loads(fh.read())

    jlab_data = data["jupyterlab"]
    if "externalExtensions" in jlab_data:
        external_extensions = jlab_data["externalExtensions"]
    else:
        external_extensions = {}

    external_extensions.update(EXTERNAL_DEPENDENCIES)
    jlab_data["externalExtensions"] = external_extensions
    data["jupyterlab"] = jlab_data
    print(json.dumps(data, indent=4, sort_keys=True))

    with open(PACKAGE_JSON, "w") as fh:
        fh.write(json.dumps(data, indent=4, sort_keys=True))


if __name__ == "__main__":
    main()
