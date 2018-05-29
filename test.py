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

def findTests(filePrefix=""):
    return [ fullTest for fullTest in [ os.path.join(root, file) for root, _, files in os.walk(".")
                                                                 for file in files
                                                                  if file.endswith(".json")
                                      ]
                       if fullTest.startswith(filePrefix)
           ]

def listTests(filePrefixes=[""]):
    return [ test for fPrefix in filePrefixes
                  for test in findTests(filePrefix=fPrefix)
           ]

def validateSchema(jsonFile, schemaFile):
    testSchema = readJSONFile(schemaFile)
    defSchema  = readJSONFile("JSONSchema/definitions.json")
    schema     = { "definitions"        : dict(defSchema["definitions"], **testSchema["definitions"])
                 , "patternProperties"  : testSchema["patternProperties"]
                 }

    jsonInput  = readJSONFile(jsonFile)
    jsonschema.validate(jsonInput, schema)

def validateTestFile(jsonFile):
    elif jsonFile.startswith("./src/GeneralStateTestsFiller/"):
        validateSchema(jsonFile, "JSONSchema/st-filler-schema.json")
    elif jsonFile.startswith("./GeneralStateTests/"):
        validateSchema(jsonFile, "JSONSchema/st-schema.json")
    elif jsonFile.startswith("./BlockchainTests/"):
        validateSchema(jsonFile, "JSONSchema/bc-schema.json")
    else:
        _die("Do not know how to validate file:", jsonFile)

def _usage():
    usage_lines = [ ""
                  , "    usage: " + sys.argv[0] + " [list|format|validate]  [<TEST_FILE_PREFIX>*]"
                  , "    where:"
                  , "            list:               command to list the matching tests."
                  , "            format:             command to format/sort the JSON file."
                  , "            validate:           command to check a file against the associated JSON schema (defaults to all files)."
                  , "            <TEST_FILE_PREFIX>: file path prefix to search for tests with."
                  , "                                eg. './src/VMTestsFiller' './VMTests' for all VMTests and their fillers."
                  ]
    _die("\n".join(usage_lines))

def main():
    if len(sys.argv) < 2:
        _usage()
    test_command = sys.argv[1]
    if len(sys.argv) == 2:
        testList = listTests()
    else:
        testList = listTests(filePrefixes=sys.argv[2:])

    if test_command == "list":
        testDo = lambda t: print(t)
    elif test_command == "format":
        testDo = lambda t: writeJSONFile(t, readJSONFile(t))
    elif test_command == "validate":
        testDo = validateTestFile
    else:
        _usage()

    for test in testList:
        _report(test_command + ":", test)
        testDo(test)

if __name__ == "__main__":
    main()
