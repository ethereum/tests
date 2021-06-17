#! /bin/bash

# Given a HEX opcode, create a template test for it

op=$1
stateTestDir=../../GeneralStateTestsFiller
testName=opc${op}DiffPlaces

# Create the appropriate YUL file
cat anyBadOpcode.yul | sed s/XX/$op/ > temp.yul


./templateGen.js $testName temp.yul 0x60A7 \
     > $stateTestDir/stBadOpcode/${testName}Filler.yml

rm temp.yul
