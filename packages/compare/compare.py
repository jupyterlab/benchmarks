# Local imports
import json
import os
import subprocess

# Constants
OUTPUT_DIR = "packages/compare"
SKIP_FILES = ['package.json', 'package-lock.json', 'tsconfig.json']
OLD_KEY = os.environ.get("OLD_KEY", "old")
NEW_KEY = os.environ.get("NEW_KEY", "new")
KEY_TYPE = os.environ.get("KEY_TYPE", "nokey")

# Paths
HERE = os.path.abspath(os.path.dirname(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(HERE))
ANALYSIS_PATH = os.path.join(REPO_ROOT, 'analysis.vl.json')
COMPARISON_PATH = os.path.join(REPO_ROOT, 'comparison.vl.json')


def main():
    # Find csv files
    csv_files = [f for f in os.listdir(HERE) if f.endswith(".csv")]

    # Find json (metadata) files
    json_files = [f for f in os.listdir(HERE) if f.endswith(".json") and not f.endswith(".vl.json")]
    for remove_file in SKIP_FILES:
        json_files.remove(remove_file)

    print(csv_files)
    print(json_files)

    # Check number of files is correct
    prefix = set([f.replace(".csv", "") for f in csv_files])
    prefix2 = set([f.replace(".json", "") for f in json_files])
    suffix = set(["-".join(f.split("-")[1:]) for f in prefix])
    if prefix != prefix2:
        raise Exception("There should be an equal number of json and csv files!")

    # Load template analysis.vl.json
    with open(ANALYSIS_PATH, "r") as fh:
        analysis = json.loads(fh.read())

    # Create a analysis.vl.json file per test pointing to the right file
    print("\n# Creating analysis files:")
    for csv_file in csv_files:
        new_analysis = analysis.copy()
        new_analysis["data"]["url"] = "./{}".format(csv_file)
        path = os.path.join(HERE, csv_file).replace(".csv", ".vl.json")
        print(path)
        with open(path, "w") as fh:
            fh.write(json.dumps(new_analysis, indent=2, sort_keys=True))

    # Load template comparison.vl.json
    with open(COMPARISON_PATH, "r") as fh:
        comparison = json.loads(fh.read())

    # Run `jlpm ci` with the right env variables for each pair of tests
    for test in suffix:
        diff_path = "diff-{0}-{1}-{2}-{3}.csv".format(KEY_TYPE, OLD_KEY, NEW_KEY, test)
        new_env = os.environ.copy()
        new_env["BENCHMARK_OUTPUT"] = diff_path
        new_env["BENCHMARK_INPUT_OLD"] = "{0}-{1}.csv".format(OLD_KEY, test)
        new_env["BENCHMARK_INPUT_NEW"] = "{0}-{1}.csv".format(NEW_KEY, test)
        print("\n# Running comparison:")
        p = subprocess.Popen(["npm", "run", "ci"], env=new_env)
        p.communicate()

        # Create a comparison.vl.json file per test pointing to the right file
        new_comparison = comparison.copy()
        new_comparison["data"]["url"] = "./{}".format(diff_path)
        path = os.path.join(HERE, diff_path).replace(".csv", ".vl.json")
        print("\n# Creating comparison file:")
        print(path)
        with open(path, "w") as fh:
            fh.write(json.dumps(new_comparison, indent=2, sort_keys=True))


def clean():
    """
    Remove files from previous runs.
    """
    for fname in os.listdir(HERE):
        fpath = os.path.join(HERE, fname)
        if fname.startswith("diff-") or fname.endswith(".vl.json"):
            os.remove(fpath)


if __name__ == "__main__":
    clean()
    main()
