#! /usr/bin/bash

# Generate and run random tests

numTests=0
testType=state
testPath=`pwd`/../../..

while getopts n:bt: opt
do
  case $opt in
  n) numTests=$OPTARG;;
  b) testType=block;;
  t) testPath=$OPTARG;;
  ?) printf "Usage: %s: [-n <num>] [-b] [-t <path>]\n" $0
     printf "            -n <number of tests>, default infinite\n"
     printf "            -b Blockchain test (default state test)\n"
     printf "            -t Path to tests repository\n"
     exit 2;;
  esac
done

echo $testPath

if [ $numTests -eq 0 ]
then
    while true
    do
        ./oneTest.sh $testType $testPath
    done
else
    for run in $(seq $numTests);
    do
       echo "Test #$run"
       ./oneTest.sh $testType $testPath
    done
fi

exit 0


