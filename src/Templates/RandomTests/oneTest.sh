#! /usr/bin/bash

suite=GeneralStateTests/stExample
test=random
dir=`pwd`/../../..

# Create a random test
./randomTest.js > ../../GeneralStateTestsFiller/stExample/randomFiller.yml

cd ~

# Run the random test on Geth
./dretesteth.sh -t $suite -- --testpath $dir --singletest $test \
                --filltests --datadir /tests/config

# Run the same random test on Besu
./dretesteth.sh -t $suite -- --testpath $dir --singletest $test \
                --clients besu --datadir /tests/config --verbosity 9
echo $?
