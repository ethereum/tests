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

gethRetVal=$?

if [ $gethRetVal -gt 0 ]; then
  cp $dir/src/GeneralStateTestsFiller/stExample/randomFiller.yml \
        /tmp/fail-on-geth-`date +%F:%H:%M:%S:%N`Filler.yml
fi


sleep 5   # Prevent race problems

# Run the same random test on Besu
./dretesteth.sh -t $suite -- --testpath $dir --singletest $test \
                --clients besu --datadir /tests/config

besuRetVal=$?

if [ $besuRetVal -gt 0 ]; then
  mv $dir/src/GeneralStateTestsFiller/stExample/randomFiller.yml \
        /tmp/fail-on-besu-`date +%F:%H:%M:%S:%N`Filler.yml
fi



# if [ $besuRetVal -eq 0 ]; then echo GOOD; fi
