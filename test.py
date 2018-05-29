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
# - Validate test inputs with JSON Schemas.

# Dependencies:
#
# - python-json
# - python-jsonschema

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
import jsonschema

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

def findTests(testDir="."):
    return [ os.path.join(root, file) for root, _, files in os.walk(testDir)
                                      for file in files
                                       if file.endswith(".json")
           ]

def validateSchema(jsonFile, schemaFile):
    _report("validating", jsonFile, "with", schemaFile)

    testSchema = readJSONFile(schemaFile)
    defSchema  = readJSONFile("JSONSchema/definitions.json")
    schema     = { "definitions"        : dict(defSchema["definitions"], **testSchema["definitions"])
                 , "patternProperties"  : testSchema["patternProperties"]
                 }

    jsonInput  = readJSONFile(jsonFile)
    jsonschema.validate(jsonInput, schema)

def validateTestFile(jsonFile):
    if jsonFile.startswith("src/GeneralStateTestsFiller/"):
        validateSchema(jsonFile, "JSONSchema/st-filler-schema.json")
    elif jsonFile.startswith("GeneralStateTests/"):
        validateSchema(jsonFile, "JSONSchema/st-schema.json")
    elif jsonFile.startswith("BlockchainTests/"):
        validateSchema(jsonFile, "JSONSchema/bc-schema.json")
    else:
        _die("Do not know how to validate file:", jsonFile)

def validateAllTests():
    for jsonFile in ( findTests(testDir="src/GeneralStateTestsFiller/")
                    + findTests(testDir="GeneralStateTests/")
                    + findTests(testDir="BlockchainTests/")
                    ):
        validateTestFile(jsonFile)

def _usage():
    usage_lines = [ ""
                  , "    usage: " + sys.argv[0] + " format   <TEST_FILE>"
                  , "    usage: " + sys.argv[0] + " validate [<TEST_FILE>*]"
                  , "    where:"
                  , "            format:      command to format/sort the JSON file."
                  , "            validate:    command to check a file against the associated JSON schema (defaults to all files)."
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
    elif test_command == "validate":
        if len(sys.argv) > 2:
            for testFile in sys.argv[2:]:
                validateTestFile(testFile)
        else:
            validateAllTests()
    else:
        _usage()

if __name__ == "__main__":
    main()
