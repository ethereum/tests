#! /bin/env node

var validate = require('jsonschema').validate;
var fs = require('fs');

var readline = require('readline');

var schema = '';
var testCode = '';
var success = true;

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function(line) {
    fs.readFile('JSONSchema/schema.json', function(err, data) {
        if (err) {
            throw err;
        }

        schema = JSON.parse(data);

        fs.readFile(line, function(err, data) {
            if (err) {
                throw err;
            }

            try {
                testCode = JSON.parse(data);
            } catch (e) {
                console.log(e);
            }

            try {
                var x = validate(testCode, schema);

                if (x.errors.length > 0) {
                    success = false;
                    console.log(line + ':\n');
                    for (var i = 0; i < x.errors.length; i++) {
                        console.log('   ' + x.errors[i] + '\n')
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
    });
});
