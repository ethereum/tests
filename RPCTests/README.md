See https://github.com/ethereum/cpp-ethereum/blob/7cc43bed7de890a496d7238092837c30c7e90729/scripts/runalltests.sh#L38 for how cpp-ethereum uses this.

FAQ
===

Cannot find module
------------------

I get an error:
```
$ node main.js $workdir/cpp-ethereum/build/eth/eth
module.js:471
    throw err;
    ^

Error: Cannot find module '/home/yh/src/tests/RLPTests/main.js'
    at Function.Module._resolveFilename (module.js:469:15)
    at Function.Module._load (module.js:417:25)
    at Module.runMain (module.js:604:10)
    at run (bootstrap_node.js:393:7)
    at startup (bootstrap_node.js:150:9)
    at bootstrap_node.js:508:3
```

Answer: if your `main.js` is in your current directory, use `./main.js` instead of just `main.js`.


Cannot find module web3
-----------------------

I get an error:
```
$ node ./main.js ~/src/cpp-ethereum/build/eth/eth
(node:27647) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: Cannot find module 'web3'
```


Has any other clients been tested with this?
--------------------------------------------
