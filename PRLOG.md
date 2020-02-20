# Pull Requests changes log

- PR [#673](https://github.com/ethereum/tests/pull/673)
upgrade and regenerate invalid RLP blockchain tests

- PR [#672](https://github.com/ethereum/tests/pull/672)
Major blockchain test refactoring, and regeneration on geth + retesteth

- PR[#671](https://github.com/ethereum/tests/pull/671)
Add test cases for SELFBALANCE inside of CALL, DELEGATECALL, and CALLCODE

- PR [#666](https://github.com/ethereum/tests/pull/666)
Remove retesteth configs. Configs are now stored in retesteth repo.

- PR [#665](https://github.com/ethereum/tests/pull/665)
Added KeyStore test based on MyCrypto file

- PR [#662](https://github.com/ethereum/tests/pull/662)
Add difficulty test for EIP-2384

- PR [#658](https://github.com/ethereum/tests/pull/658)
Reduce 50k bytes code in quadratic complexity tests to 20k bytes
Resolves issue https://github.com/ethereum/tests/issues/657

- PR [#654](https://github.com/ethereum/tests/pull/654)
Add more tests for EXTCODEHASH of nonexistent and post suicide accounts
https://github.com/ethereum/tests/issues/652

- PR [#651](https://github.com/ethereum/tests/pull/651)
Use additional forks in retesteth configs. 
Additional forks used in TransitionTests and not automatically used in StateTests/BlockchainTests

- PR [#650](https://github.com/ethereum/tests/pull/650)
Update default mining reward config for transition nets in retesteth configs.
To avoid retesteth error when filling the state tests

- PR [#649](https://github.com/ethereum/tests/pull/649)
Add state tests to validate the EIP-1706/EIP-2200 out of gas condition, 
specifically aimed at validating less than or equals to the stipend handling.

- PR [#648](https://github.com/ethereum/tests/pull/648)
Seal blockchain tests <=ConstantinopleFix into LegacyTests 
Regenerate blockchain tests for Istanbul fork

- PR [#647](https://github.com/ethereum/tests/pull/647)
Add tests checking stack validity of SWAP
Add tests checking DIV/SDIV/MOD/SDIV by zero

- PR [#646](https://github.com/ethereum/tests/pull/646)
Add Transition genesis retesteth configurations to defult geth configs
