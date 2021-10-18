#! /usr/bin/bash

# Generate and run random tests

numTests=0
testType=state

while getopts n:b opt
do
  case $opt in
  n) numTests=$OPTARG;;
  b) testType=block;;
  ?) printf "Usage: %s: [-n <num>] [-b]\n" $0
     printf "            -n <number of tests>, default infinite\n"
     printf "            -b Blockchain test (default state test\n"
     exit 2;;
  esac
done

if [ $numTests -eq 0 ]
then
    while true
    do
        ./oneTest.sh $testType
    done
else
    for run in $(seq $numTests);
    do
       echo "Test #$run"
       ./oneTest.sh $testType
    done
fi

exit 0


