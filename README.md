tests   [![Build Status](https://travis-ci.org/ethereum/tests.svg?branch=develop)](https://travis-ci.org/ethereum/tests)
=====

Common tests for all clients to test against.

Test Formats
------------

See descriptions of the different test formats in the official documentation at  http://ethereum-tests.readthedocs.io/.

*Note*:  
The format of BlockchainTests recently changed with the introduction of a new field ``sealEngine`` (values: ``NoProof`` | ``Ethash``), see related JSON Schema [change](https://github.com/ethereum/tests/commit/3be71ec3364a01fd4f2cb9b9fd086f3f69f0225c) or BlockchainTest format [docs](https://ethereum-tests.readthedocs.io/en/latest/test_types/blockchain_tests.html) for reference.

This means that you can skip PoW validation for ``NoProof`` tests but also has the consequence that it is not possible to rely on/check ``PoW`` related block parameters for these tests any more.

Clients using the library
-------------------------

The following clients make use of the tests from this library. You can use these implementations for inspiration on how to integrate. If your client is missing, please submit a PR (requirement: at least some minimal test documentation)!

- [Mana](https://github.com/mana-ethereum/mana) (Elixir): [Docs](https://github.com/mana-ethereum/mana#testing), Test location: ``ethereum_common_tests``
- [go-ethereum](https://github.com/ethereum/go-ethereum) (Go): [Docs](https://github.com/ethereum/go-ethereum/wiki/Developers'-Guide), Test location: ``tests/testdata``
- [Parity Ethereum](https://github.com/paritytech/parity-ethereum) (Rust): [Docs](https://wiki.parity.io/Coding-guide), Test location: ``ethcore/res/ethereum/tests``
- [ethereumjs-vm](https://github.com/ethereumjs/ethereumjs-vm) (JavaScript): [Docs](https://github.com/ethereumjs/ethereumjs-vm#testing), Test location: ``ethereumjs-testing`` dependency
- [Trinity](https://github.com/ethereum/py-evm) (Python): [Docs](https://py-evm.readthedocs.io/en/latest/contributing.html#running-the-tests), Test location: `fixtures`
- [Pantheon](https://github.com/PegaSysEng/pantheon) (Java): [Docs](https://github.com/PegaSysEng/pantheon/blob/master/docs/development/building.md#ethereum-reference-tests), Test Location: ``ethereum/referencetests/src/test/resources``

Contents of this repository
---------------------------

Do not change test files in folders: 
* StateTests
* BlockchainTests
* TransactionTests 
* VMTests

It is being created by the testFillers which could be found at src folder. The filler specification and wiki are in development so please ask on gitter channel for more details.

If you want to modify a test filler or add a new test please contact @winsvega at https://gitter.im/ethereum/aleth

All files should be of the form:

```
{
	"test1name":
	{
		"test1property1": ...,
		"test1property2": ...,
		...
	},
	"test2name":
	{
		"test2property1": ...,
		"test2property2": ...,
		...
	}
}
```

Arrays are allowed, but don't use them for sets of properties - only use them for data that is clearly a continuous contiguous sequence of values.

Test Set Sanitation
-------------------

### Setup

(Requires `virtualenv`)
```
#> virtualenv -p python3 .env3
#> . .env3/bin/activate
#> python3 -m pip install -r requirements.txt
```

### Checkers

Several basic checks against the test-set are performed to ensure that they have been filled and are formatted correctly.
Currently, there are three types of checks that we can perform:

-   `make TEST_PREFIX.format`: check that the JSON is formatted correctly.
-   `make TEST_PREFIX.valid`: check that the JSON files are valid against the JSON schemas in `./JSONSchema`.
-   `make TEST_PREFIX.filled`: check that the JSON tests are filled with the correct source hashes against the fillers.

The constant `TEST_PREFIX` is a path prefix to the test-set you're interested in performing the checks on.
For instance:

-   `make ./src/VMTestsFiller/vmArithmeticTest.format` will check that all JSON files in `./src/VMTestsFiller/vmArithmeticTest` are formatted correctly.
-   `make ./src.valid` will check that all the JSON files in `./src` are valid against the JSON schemas in `./JSONSchema`.
-   `make ./BlockchainTests.filled` will check that the source hashes in the JSON tests in `./BlockchainTests` are the same as the hashes of the fillers in `./src/BlockchainTestsFiller`.

These checks are all performed by the file `./test.py`, which can be invoked on individual files as well.
Run `./test.py` with no arguments for help.

### Sanitizers

The above checkers are packaged together into sanitizers for each test-suite, marking which testsuites are passing which testers.
See the `TODO`s in the `Makefile` to see which checkers are enabled for which test-suites.

-   `make sani`: will run all passing sanitizers on all passing testsuites.
-   `make sani-TESTNAME`: will run just the passing sanitizers for the given testsuite.
    `TESTNAME` can be one of:

    -   `vm`: VMTests and VMTestsFiller
    -   `gs`: GeneralStateTests and GeneralStateTestsFiller
    -   `bc`: BlockchainTests and BlockchainTestsFiller
    -   `tx`: TransactionTests and TransactionTestsFiller

### Runners/Fillers

The tests can also be run/filled with the same `Makefile`.

-   `make run`: will use `testeth` to all the test-suites.
-   `make fill`: will use `testeth` to fill all the test-suites.
-   `make TEST_PREFIX.run`: runs a single testsuite.
-   `make TEST_PREFIX.fill`: fills and formats a single testsuite.

FAQ
---

### I want to test my client, which version shall I use?

[The develop branch in ethereum/tests](https://github.com/ethereum/tests/tree/develop) is the version to use.

### How can I add a new test case?

[testeth guide to generate test cases](https://github.com/ethereum/testeth/blob/develop/doc/generating_tests.rst)
