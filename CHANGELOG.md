## Unreleased

No changes yet :)

## v6.0.0-beta.3

### Potentially breaking changes

- #547 requires your integration to understand the network `ByzantiumToConstantinopleAt5`, which is analogous to existing pseudo networks such as `FrontierToHomesteadAt5` and `EIP158ToByzantiumAt5`.

- #557 changes the format of the rlp tests, byte strings are now prefixed with "0x"

### [EIP 1234](https://eips.ethereum.org/EIPS/eip-1234)

- #547 added a test for the difficulty changes. This adds the network `ByzantiumToConstantinopleAt5`, which is analogous to existing networks such as `FrontierToHomesteadAt5` and `EIP158ToByzantiumAt5`.

### [EIP 1052](https://eips.ethereum.org/EIPS/eip-1052)

- #548 Added a test for EXTCODEHASH called on an account created in the same transaction
- #549 added a few more tests for EXTCODEHASH and EXTCODESIZE on accounts created in the same transaction
- #550 Checks that changes to an account's nonce, balance, or storage do not change the result of calling EXTCODEHASH
- #552 Added another EXTCODEHASH test, what if it's run on accounts which have self-destructed?
- #563 Another spectacularly detailed test case of EXTCODEHASH involving recursive calls and oog-induced revert
- #566 checks that EXTCODEHASH returns a different result when the code changes
- #568 adds a test for EXTCODEHASH; what if the contract being hashed self destructed while in the middle of a delegate call?
- #569 calls EXTCODEHASH on an empty contract

### Misc

- #551 tests for a Constantinople bug the fuzzer found in geth
- #544 adds an RLP test, [courtesy of the mana team](https://github.com/mana-ethereum/ex_rlp/pull/17)
- #557 changes the format of the rlp tests, byte strings are now prefixed with "0x"
- #561 changed some of the tests. There were some changes to `testeth` which made the previous tests impossible to regenerate. They were refactored but not in a way which should break any client.
- #567 adds a Constantinople test Mana found when they failed to sync with Ropsten

## v6.0.0-beta.2 Release CW 46

### Constantinople Test Updates

- Added initial test cases for ``EXTCODEHASH`` [EIP-1052](https://eips.ethereum.org/EIPS/eip-1052), see PR [#484](https://github.com/ethereum/tests/pull/484)
- More ``EXTCODEHASH`` tests, see PR [#544](https://github.com/ethereum/tests/pull/544)
- New ``SSTORE`` state tests and blockchain tests where an external call is overwriting/colliding with new ``SSTORE`` gas calculation rules, see PR [#535](https://github.com/ethereum/tests/pull/535)

### Test Coverage

- New tests to cover cases where the result of an EVM opcode is written to a specified memory range and the result is shorter than the specified range, see PR [#538](https://github.com/ethereum/tests/pull/538)

### Library Changes

- Added ``.idea`` to ``.gitignore``, see PR [#546](https://github.com/ethereum/tests/pull/546)

### Docs

[Test generation docs](https://ethereum-tests.readthedocs.io/en/latest/generating-tests.html) have been consolidated and integrated in the central ReadTheDocs testing documentation. 

We also updated outdated parts on this doc section (see PR [#539](https://github.com/ethereum/tests/pull/539)), so it should in principle now be possible to follow the guide and end up with a working test creation setup. There might still be some glitches, please let us know or submit a PR on [ethereum/tests](https://github.com/ethereum/tests) to if you stumble over something.

Other changes:

- New list with [clients using the library](https://github.com/ethereum/tests#clients-using-the-library) in README, see PR [#537](https://github.com/ethereum/tests/pull/537)

## v6.0.0-beta.1 Release CW 43

### Constantinople Test Summary

- ``EIP-145`` (Bitwise shifting): Tests for ``SAR``, ``SHL`` and ``SHR`` in [GeneralStateTests/stShift](https://github.com/ethereum/tests/tree/develop/GeneralStateTests/stShift) directory, blockchain tests analogue
- ``EIP-1014`` (``CREATE2``): Various cases covered in [GeneralStateTests/stCreate2](https://github.com/ethereum/tests/tree/develop/GeneralStateTests/stCreate2) directory, blockchain tests analogue
- ``EIP-1052`` (``EXTCODEHASH``): Tests not merged yet, open PR [#484](https://github.com/ethereum/tests/pull/484)
- ``EIP-1283`` (``SSTORE``): Dedicated tests in [GeneralStateTests/stSStoreTest](https://github.com/ethereum/tests/tree/develop/GeneralStateTests/stSStoreTest) directory also covering Ropsten consensus issue cases, blockchain tests analogue, generally refilled state tests with new ``SSTORE`` gas metering rules in PR [#511](https://github.com/ethereum/tests/pull/511)
- ``EIP-1234`` (difficulty): New ``difficultyConstantinople.json`` file and regenerated ``difficultyRopsten.json`` files in the [BasicTests](https://github.com/ethereum/tests/blob/develop/BasicTests/) directory, see PR [#518](https://github.com/ethereum/tests/pull/518)

### Library Changes

Be aware that the format of BlockchainTests recently changed with the introduction of a new field ``sealEngine`` (values: ``NoProof`` | ``Ethash``), see related JSON Schema [change](https://github.com/ethereum/tests/commit/3be71ec3364a01fd4f2cb9b9fd086f3f69f0225c) or BlockchainTest format [docs](https://ethereum-tests.readthedocs.io/en/latest/test_types/blockchain_tests.html) for reference.

This means that you can faster-execute ``NoProof`` based tests skipping block validation. These tests nevertheless doesn't provide reliable values for ``PoW``-based block header fields any more (``mixHash``, ``nonce``), so make sure that you don't rely on the correctness of these values for the tests to pass.
