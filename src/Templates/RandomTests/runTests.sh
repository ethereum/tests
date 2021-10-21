#! /usr/bin/bash

# Generate and run random tests

numTests=0
testType=state
testPath=`pwd`/../../..
errPath=/tmp

while getopts n:bt:e: opt
do
  case $opt in
  n) numTests=$OPTARG;;
  b) testType=block;;
  t) testPath=$OPTARG;;
  e) errPath=$OPTARG;
  ?) printf "Usage: %s: [-n <num>] [-b] [-t <path>] [-e <path>]\n" $0
     printf "            -n <number of tests>, default infinite\n"
     printf "            -b Blockchain test (default state test)\n"
     printf "            -t Path to tests repository\n"
     printf "            -e Path to save errors\n"
     exit 2;;
  esac
done

if [ $numTests -eq 0 ]
then
    while true
    do
        ./oneTest.sh $testType $testPath $errPath
    done
else
    for run in $(seq $numTests);
    do
       echo "Test #$run"
       ./oneTest.sh $testType $testPath $errPath
    done
fi

exit 0


