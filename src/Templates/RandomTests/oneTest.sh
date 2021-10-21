#! /usr/bin/bash

# Usage:
# oneTest.sh <test type>
suite=GeneralStateTests/stExample
test=random
testPath=$2
errPath=$3
testType=$1

echo Test type $testType

# Create a random test
./randomTest.js > $testPath/src/GeneralStateTestsFiller/stExample/${test}Filler.yml

cd ~

# Run the random test on Geth
if [ "$testType" == "block" ]
then
    ./dretesteth.sh -t $suite -- --testpath $testPath --singletest $test \
                --all --fillchain --filltests --datadir /tests/config
else
    ./dretesteth.sh -t $suite -- --testpath $testPath --singletest $test \
                --all --filltests --datadir /tests/config
fi

gethRetVal=$?

if [ $gethRetVal -gt 0 ]; then
  mv $testPath/src/GeneralStateTestsFiller/stExample/randomFiller.yml \
        $errPath/fail-on-geth-$testType-`date +%F:%H:%M:%S:%N`Filler.yml
  exit 1
fi


sleep 5   # Prevent race problems

# Run the same random test on Besu
# Run the random test on Geth
if [ "$testType" == "block" ]
then
    ./dretesteth.sh -t BC$suite -- --testpath $testPath --singletest $test \
                --all --clients besu --datadir /tests/config
else
     ./dretesteth.sh -t $suite -- --testpath $testPath --singletest $test \
                --all --clients besu --datadir /tests/config
fi



besuRetVal=$?

if [ $besuRetVal -gt 0 ]; then
  mv $testPath/src/GeneralStateTestsFiller/stExample/randomFiller.yml \
        $errPath/fail-on-besu-$testType-`date +%F:%H:%M:%S:%N`Filler.yml
fi

