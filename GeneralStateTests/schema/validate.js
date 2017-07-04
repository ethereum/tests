#! /bin/env node

var validate = require('jsonschema').validate;
var fs = require('fs');

var readline = require('readline');
var schema = '';
var testCode = '';

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    fs.readFile('schema.json', function(err, data) {
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
            } catch(e) {
                console.log(e);
            }

            try {
                var x = validate(testCode, schema);

                if (x.errors.length > 0) {
                    console.log(line+':\n');
                    console.log(x.errors+'\n')
                }
            } catch(e) {
                console.log(e);
            }
        });
    });
});
