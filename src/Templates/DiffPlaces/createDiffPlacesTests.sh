#! /usr/bin/bash

# Create template tests that run the same code in difference places
# (just run it, run it in a called account, etc. - the full list is
# in templateGen.js

stateTestDir=../../GeneralStateTestsFiller

./templateGen.js diffPlaces selfBalance.yul 1000000000000000000 \
          > $stateTestDir/stSelfBalance/diffPlacesFiller.yml
./templateGen.js invalidDiffPlaces invalid.yul 0x60A7 \
          > $stateTestDir/stBadOpcode/invalidDiffPlacesFiller.yml
./templateGen.js gasPriceDiffPlaces gasPrice.yul 2000 \
          > $stateTestDir/stEIP1559/gasPriceDiffPlacesFiller.yml
./templateGen.js baseFeeDiffPlaces baseFee.yul 10 \
          > $stateTestDir/stEIP1559/baseFeeDiffPlacesFiller.yml



