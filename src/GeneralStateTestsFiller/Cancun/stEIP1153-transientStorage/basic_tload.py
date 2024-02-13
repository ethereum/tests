"""
Ethereum Transient Storage EIP Tests
https://eips.ethereum.org/EIPS/eip-1153
"""

from typing import Dict, Union

import pytest

from ethereum_test_tools import (
    Account,
    Address,
    Environment,
    StateTestFiller,
    TestAddress,
    Transaction
)
from ethereum_test_tools.vm.opcode import Opcodes as Op

REFERENCE_SPEC_GIT_PATH = "EIPS/eip-1153.md"
REFERENCE_SPEC_VERSION = "2f8299df31bb8173618901a03a8366a3183479b0"

@pytest.mark.valid_from("Cancun")
def test_basic_tload(
    state_test: StateTestFiller,
):
    """
    Covered .json vectors:
    load arbitrary value is 0 at beginning of transaction (01_tloadBeginningTxnFiller.yml)
    tload from same slot after tstore returns correct value (02_tloadAfterTstoreFiller.yml)
    Loading any other slot after storing to a slot returns 0. (03_tloadAfterStoreIs0Filler.yml)
    tload costs 100 gas same as a warm sload (16_tloadGasFiller.yml)
    tload from same slot after store returns 0 (18_tloadAfterStoreFiller.yml)
    """

    address_to = Address("A00000000000000000000000000000000000000A")
    tload_at_transaction_begin_result = 1

    tstore_value = 88
    tload_after_tstore_result = 2
    tload_after_tstore_result_second_time = 3
    tload_wrong_after_tstore_result = 4

    #N         OPNAME       GAS_COST  TOTAL_GAS REMAINING_GAS     STACK
    #28-1         MSTORE         2     20748   4958252    2:[4ba82f,0,]
    #              MSTORE [0] = 4958255
    #29-1          PUSH1         3     20754   4958246
    #30-1          TLOAD       100     20757   4958243    1:[10,]
    #31-1            GAS         2     20857   4958143    1:[2,]
    #32-1          PUSH1         3     20859   4958141    2:[2,4ba7bd,]
    #33-1         MSTORE         6     20862   4958138    3:[2,4ba7bd,20,]
    #              MSTORE [32] = 4958141
    extra_opcode_gas = 11  #mstore(3), push1(3),gas(2),push1(3)

    tload_nonzero_gas_price_result = 16
    tload_zero_gas_price_result = 1601

    tload_from_sstore_result = 18


    pre = {
        address_to: Account(
            balance=1000000000000000000,
            nonce=0,
            code=Op.JUMPDEST()
            # 01_tloadBeginningTxnFiller.yml
            + Op.SSTORE(tload_at_transaction_begin_result, Op.TLOAD(0))
            # 02_tloadAfterTstoreFiller.yml
            + Op.TSTORE(2, tstore_value)
            + Op.SSTORE(tload_after_tstore_result, Op.TLOAD(2))
            + Op.SSTORE(tload_after_tstore_result_second_time, Op.TLOAD(2))
            # 03_tloadAfterStoreIs0Filler.yml
            + Op.TSTORE(3, tstore_value)
            + Op.SSTORE(tload_wrong_after_tstore_result, Op.TLOAD(0))
            # 16_tloadGasFiller.yml calculate tload gas
            + Op.TSTORE(16, 2)
            + Op.MSTORE(0, Op.GAS())  #hot load the memory
            + Op.MSTORE(0, Op.GAS())
            + Op.TLOAD(16)
            + Op.MSTORE(32, Op.GAS())
            + Op.SSTORE(tload_nonzero_gas_price_result, Op.SUB(Op.MLOAD(0), Op.MLOAD(32)))
            + Op.SSTORE(tload_nonzero_gas_price_result, Op.SUB(Op.SLOAD(16), extra_opcode_gas))
            # from zero slot
            + Op.MSTORE(0, Op.GAS())
            + Op.TLOAD(5)
            + Op.MSTORE(32, Op.GAS())
            + Op.SSTORE(tload_zero_gas_price_result, Op.SUB(Op.MLOAD(0), Op.MLOAD(32)))
            + Op.SSTORE(tload_zero_gas_price_result, Op.SUB(Op.SLOAD(1601), extra_opcode_gas))
            # 18_tloadAfterStoreFiller.yml
            + Op.SSTORE(18, 22)
            + Op.SSTORE(tload_from_sstore_result, Op.TLOAD(18)),
          
            storage={
                tload_at_transaction_begin_result: 0xFF,
                tload_after_tstore_result: 0xFF,
                tload_after_tstore_result_second_time: 0xFF,
                tload_wrong_after_tstore_result: 0xFF,
                tload_nonzero_gas_price_result: 0xFF,
                tload_zero_gas_price_result: 0xFF,
                tload_from_sstore_result: 0xFF
            },
        ),
        TestAddress: Account(
            balance=7000000000000000000,
            nonce=0,
            code="0x",
            storage={},
        ),
    }

    post: Dict[Address, Union[Account, object]] = {}

    post[address_to] = Account(
        storage={
            tload_at_transaction_begin_result: 0x00,
            tload_after_tstore_result: tstore_value,
            tload_after_tstore_result_second_time: tstore_value,
            tload_wrong_after_tstore_result: 0x00,
            tload_nonzero_gas_price_result: 100,
            tload_zero_gas_price_result: 100,
            tload_from_sstore_result: 0x00
        }
    )

    tx = Transaction(
        nonce=0,
        to=address_to,
        gas_price=10,
        data=b"",
        gas_limit=5000000,
        value=0,
    )

    state_test(env=Environment(), pre=pre, post=post, tx=tx)