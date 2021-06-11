#! /usr/bin/bash

./templateGen.js selfBalance.yul 1000000000000000000 > ../stSelfBalance/templateFiller.yml
./templateGen.js invalid.yul 0x60A7 > ../stBadOpcode/templateFiller.yml
./templateGen.js gasPrice.yul 10 > ../stEIP1559/templateFiller.yml
