#! /usr/bin/bash

# Usage:
# oneTest.sh <test type>
suite=GeneralStateTests/stExample
test=random

testType=$1
testPath=$2
errPath=$3
nodocker=$4

echo Test type $testType

if [ $nodocker ]
then
   cmd="retesteth -t $suite -- "
else
   cmd="./dretesteth.sh -t $suite -- --datadir /tests/config "
fi


# Create a random test
./randomTest.js > $testPath/src/GeneralStateTestsFiller/stExample/${test}Filler.yml

cd ~

# Run the random test on Geth
if [ "$testType" == "block" ]
then
    $cmd --testpath $testPath --singletest $test \
         --all --fillchain --filltests
else
    $cmd --testpath $testPath --singletest $test \
         --all --filltests
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
    cmd=`echo $cmd | sed 's/-t /-t BC/'`
    $cmd --testpath $testPath --singletest $test \
         --all --clients besu
else
     $cmd --testpath $testPath --singletest $test \
          --all --clients besu
fi



besuRetVal=$?

if [ $besuRetVal -gt 0 ]; then
  mv $testPath/src/GeneralStateTestsFiller/stExample/randomFiller.yml \
        $errPath/fail-on-besu-$testType-`date +%F:%H:%M:%S:%N`Filler.yml
fi

