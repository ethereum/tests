#!/usr/bin/env python3

# Eventual goals:
#
# - Check validity of tests fillers.
# - Filter test fillers based on properties.
# - Convert between various test filler formats.

# Non-goals:
#
# - Test filling.
# - Test post-state checking.

# Current goals:
#
# - Generate GeneralStateTests from VMTests.

# Input:
#
# - VMTest filler directory/name, without suffix Filler.json
#   eg. vmArithmeticTest/add0

# Output:
#
# - GeneralStateTest filler
#   eg. stVMTests/vmArithmeticTest/add0Filler.json

import sys
import os
import json

def _report(*msg):
    print("== " + sys.argv[0] + ":", *msg, file=sys.stderr)

def _die(*msg, exit_code=1):
    _report(*msg)
    _report("exiting...")
    sys.exit(exit_code)

def readJSONFile(fname):
    if not os.path.isfile(fname):
        _die("Not a file:", fname)
    with open(fname, "r") as f:
        fcontents = f.read()
        return json.loads(fcontents)

def writeJSONFile(fname, fcontents):
    if not os.path.exists(os.path.dirname(fname)):
        os.makedirs(os.path.dirname(fname))
    with open(fname, "w") as f:
        f.write(json.dumps(fcontents, indent=4, sort_keys=True))

def _usage():
    usage_lines = [ ""
                  , "    usage: " + sys.argv[0] + " format <TEST_FILE>"
                  , "    where:"
                  , "            format:      command to format/sort the JSON file."
                  , "            <TEST_FILE>: JSON test file/filler to read and write with sorted keys/standard formatting."
                  ]
    _die("\n".join(usage_lines))

def main():
    if len(sys.argv) < 2:
        _usage()
    test_command = sys.argv[1]
    if test_command == "format":
        file_name = sys.argv[2]
        writeJSONFile(file_name, readJSONFile(file_name))
    else:
        _usage()

if __name__ == "__main__":
    main()
