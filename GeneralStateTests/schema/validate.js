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
    fs.readFile('simple-schema.json', function(err, data) {
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
                debugger;
            }

            try {
                var x = validate(testCode, schema);
            } catch(e) {
                console.log(line);
            }
            
        });
    });
});

/*
fs.readFile('simple-schema.json', function(err, data) {
    if (err) {
        throw err;
    }

    schema = JSON.parse(data);
    fs.readFile('example.json', function(err, data) {
        if (err) {
            throw err;
        }

        testCode = JSON.parse(data);
        var x = validate(testCode, schema);
        console.log(x);
        debugger;
    });
});
*/
