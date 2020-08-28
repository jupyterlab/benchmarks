# Local imports
import json
import os

# Paths
HERE = os.path.abspath(os.path.dirname(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(HERE))
PACKAGE_JSON = os.path.join(REPO_ROOT, "package.json")
PLAYWRIGTH = os.environ.get("PLAYWRIGTH", "1.0.2")
DEPENDENCIES = {
    "playwright": PLAYWRIGTH
}


def main():
    with open(PACKAGE_JSON, "r") as fh:
        data = json.loads(fh.read())

    current_deps = data["dependencies"]
    current_deps.update(DEPENDENCIES)
    data["dependencies"] = current_deps
    print(json.dumps(data, indent=4, sort_keys=True))

    with open(PACKAGE_JSON, "w") as fh:
        fh.write(json.dumps(data, indent=4, sort_keys=True))


if __name__ == "__main__":
    main()
