#!/usr/bin/env python3

# For help:
#
# - Run with no arguments.
# - Ask Everett Hildenbrandt (@ehildenb).

# Goals:
#
# - Validate test inputs with JSON Schemas.
# - Check that tests have been filled.
# - Filter tests based on properties.
# - Convert between various test filler formats.

# Non-goals:
#
# - Test filling.
# - Test post-state checking.

# Dependencies:
#
# - python-json
# - python-yaml
# - python-jsonschema
# - python-pysha3

import sys
import os
import json
import yaml
import jsonschema
import sha3

# Utilities
# =========

# Errors/Reporting

exit_status = 0
error_log   = []

def _report(*msg):
    print("== " + sys.argv[0] + ":", *msg, file=sys.stderr)

def _logerror(*msg):
    global exit_status
    global error_log

    _report("ERROR:", *msg)
    error_log.append(" ".join(msg))
    exit_status = 1

def _die(*msg, exit_code=1):
    _report(*msg)
    _report("exiting...")
    sys.exit(exit_code)

# Filesystem/parsing

def readFile(fname):
    if not os.path.isfile(fname):
        _die("Not a file:", fname)
    with open(fname, "r") as f:
        fcontents = f.read()
        try:
            if fname.endswith(".json"):
                fparsed = json.loads(fcontents)
            elif fname.endswith(".yml"):
                fparsed = yaml.load(fcontents)
            else:
                _die("Do not know how to load:", fname)
            return fparsed
        except:
            _die("Could not load file:", fname)

def writeFile(fname, fcontents):
    if not os.path.exists(os.path.dirname(fname)):
        os.makedirs(os.path.dirname(fname))
    with open(fname, "w") as f:
        f.write(json.dumps(fcontents, indent=4, sort_keys=True) + "\n")

# Functionality
# =============

# Listing tests

def findTests(filePrefix=""):
    return [ fullTest for fullTest in [ os.path.join(root, file) for root, _, files in os.walk(".")
                                                                 for file in files
                                                                  if file.endswith(".json") or file.endswith(".yml")
                                      ]
                       if fullTest.startswith(filePrefix)
           ]

def listTests(filePrefixes=[""]):
    return [ test for fPrefix in filePrefixes
                  for test in findTests(filePrefix=fPrefix)
           ]

# Schema Validation

def validateSchema(testFile, schemaFile):
    testSchema = readFile(schemaFile)
    defSchema  = readFile("JSONSchema/definitions.json")
    schema     = { "definitions"        : dict(defSchema["definitions"], **testSchema["definitions"])
                 , "patternProperties"  : testSchema["patternProperties"]
                 }

    testInput  = readFile(testFile)
    jsonschema.validate(testInput, schema)
    try:
        jsonschema.validate(testInput, schema)
    except Exception as e:
        _logerror("Validation failed:", "schema", schemaFile, "on", testFile, "\n", str(e))

def validateTestFile(testFile):
    if testFile.startswith("./src/VMTestsFiller/"):
        schemaFile = "JSONSchema/vm-filler-schema.json"
    elif testFile.startswith("./src/GeneralStateTestsFiller/"):
        schemaFile = "JSONSchema/st-filler-schema.json"
    elif testFile.startswith("./src/BlockchainTestsFiller/"):
        schemaFile = "JSONSchema/bc-filler-schema.json"
    elif testFile.startswith("./src/GenesisTestsFiller/"):
        schemaFile = "JSONSchema/genesis-filler-schema.json"
    elif testFile.startswith("./VMTests/"):
        schemaFile = "JSONSchema/vm-schema.json"
    elif testFile.startswith("./GeneralStateTests/"):
        schemaFile = "JSONSchema/st-schema.json"
    elif testFile.startswith("./BlockchainTests/"):
        schemaFile = "JSONSchema/bc-schema.json"
    else:
        _logerror("Do not know how to validate file:", testFile)
        return
    validateSchema(testFile, schemaFile)

# Check tests filled

def hashFile(fname):
    with open(fname ,"rb") as f:
        k = sha3.keccak_256()
        k.update(f.read())
        return k.hexdigest()

def checkFilled(testFile):
    testData = readFile(testFile)
    if not ( testFile.startswith("./src/BlockchainTestsFiller/GeneralStateTests/")
        # or testFile.startswith("./src/BlockchainTestsFiller/VMTests/")
          or testFile.startswith("./VMTests/")
          or testFile.startswith("./GeneralStateTests/")
          or testFile.startswith("./TransactionTests/")
          or testFile.startswith("./BlockchainTests/")
           ):
      # _report("Not a file that is filled:", testFile)
        return
    for test in testData:
        if "_info" in testData[test]:
            fillerSource = testData[test]["_info"]["source"]
            fillerHash   = testData[test]["_info"]["sourceHash"]
            if fillerHash != hashFile(fillerSource):
                _logerror("Test must be filled:", testFile)

# Simple Test Conversions

def vm2gs(testFile):
    if not testFile.startswith("./src/VMTestsFiller/"):
        _logerror("Cannot convert to GeneralStateTestsFiller:", testFile)
        return

    testName   = testFile[len("./src/VMTestsFiller/"):]
    outputFile = "./src/GeneralStateTestsFiller/stVMTests/" + testName

    sourceHash = hashFile(testFile)
    scriptHash = hashFile(sys.argv[0])

    vmTests = readFile(testFile)
    gsTests = {}
    for t in vmTests:
        try:
            vmTest = vmTests[t]
            vmTestAcct = vmTest["exec"]["address"]
            gsTest = { "_info"  : { "comment"    : "Generated GeneralStateTestsFiller from VMTestsFiller"
                                  , "scriptHash" : scriptHash
                                  , "source"     : testFile
                                  , "sourceHash" : sourceHash
                                  }
                     , "env"    : vmTest["env"]
                     , "pre"    : { "a94f5374fce5edbc8e2a8697c15331677e6ebf0b" : { "balance" : "429496729600"
                                                                                 , "code"    : ""
                                                                                 , "nonce"   : "0"
                                                                                 , "storage" : { }
                                                                                 }
                                  , vmTestAcct : vmTest["pre"][vmTestAcct]
                                  }
                     , "transaction" : { "data"      : [""]
                                       , "gasLimit"  : [ vmTest["env"]["currentGasLimit"] ]
                                       , "gasPrice"  : "1"
                                       , "nonce"     : "0"
                                       , "secretKey" : "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"
                                       , "to"        : vmTestAcct
                                       , "value"     : [ "10" ]
                                       }
                     }
            if not ("previousHash" in gsTest["env"]):
                gsTest["env"]["previousHash"] = "5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6"
            if "expect" in vmTest:
                gsTest["expect"] = [ { "indexes" : { "data"  : -1
                                                   , "gas"   : -1
                                                   , "value" : -1
                                                   }
                                     , "network" : [">=Frontier"]
                                     , "result"  : vmTest["expect"]
                                     }
                                   ]
            gsTests[t] = gsTest

        except Exception as e:
            _logerror("Failing to build GeneralStateTestsFiller from:", testFile, "\n" + str(e))
            return

    writeFile(outputFile, gsTests)

# Main
# ====

def _usage():
    usage_lines = [ ""
                  , "    usage: " + sys.argv[0] + " [list|format|validate]  [<TEST_FILE_PREFIX>*]"
                  , "    where:"
                  , "            list:               command to list the matching tests."
                  , "            format:             command to format/sort the JSON/YAML file."
                  , "            validate:           command to check a file against the associated JSON schema (defaults to all files)."
                  , "            <TEST_FILE_PREFIX>: file path prefix to search for tests with."
                  , "                                eg. './src/VMTestsFiller' './VMTests' for all VMTests and their fillers."
                  ]
    _die("\n".join(usage_lines))

def main():
    global error_log
    global exit_status

    if len(sys.argv) < 2:
        _usage()
    test_command = sys.argv[1]
    if len(sys.argv) == 2:
        testList = listTests()
    else:
        testList = listTests(filePrefixes=sys.argv[2:])

    if len(testList) == 0:
        _die("No tests listed!!!")

    if test_command == "list":
        testDo = lambda t: print(t)
    elif test_command == "format":
        testDo = lambda t: writeFile(t, readFile(t))
    elif test_command == "validate":
        testDo = validateTestFile
    elif test_command == "checkFilled":
        testDo = checkFilled
    elif test_command == "vm2gs":
        testDo = vm2gs
    else:
        _usage()

    for test in testList:
        # turn on for more info
        # _report(test_command + ":", test)
        testDo(test)

    if exit_status != 0:
        _die("Errors reported!\n[ERROR] " + "\n[ERROR] ".join(error_log))

if __name__ == "__main__":
    main()
