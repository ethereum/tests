#! /bin/env python

import glob, json, sys, jsonschema

with open('JSONSchema/schema.json') as schema_data:
    schema = json.load(schema_data)

#for filename in glob.glob('GeneralStateTests/*.json'):
#    print(filename)

while True:
    line = sys.stdin.readline()
    if not line:
        if success:
            sys.exit(0)
        else:
            sys.exit(-1)

    line = line.strip('\n')
    with open(line) as test_data:
        test = json.load(test_data)

        try:
            jsonschema.validate(test, schema)
        except jsonschema.exceptions.ValidationError as e:
            success = False
            print(line+':\n\n')
            print(e)
            print('\n')

