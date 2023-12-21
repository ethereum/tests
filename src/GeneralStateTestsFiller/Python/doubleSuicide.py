"""
Suicide scenario requested test
https://github.com/ethereum/tests/issues/1325
"""

from collections import namedtuple
from typing import Any, Mapping, Optional

import pytest
from ethereum_test_forks import (
    Berlin,
    Cancun,
    Fork,
    Frontier,
    Homestead,
    London,
    Merge,
    Shanghai,
    is_fork
)
from ethereum_test_tools import (
    Account,
    Code,
    Environment,
    StateTestFiller,
    TestAddress,
    Transaction,
    YulCompiler,
)
from ethereum_test_tools.vm.opcode import Opcodes as Op


@pytest.fixture
def env():  # noqa: D103
    return Environment(
        coinbase="0x2adc25665018aa1fe0e6bc666dac8fc2697ff9ba",
        difficulty=0x020000,
        gas_limit=71794957647893862,
        number=1,
        timestamp=1000,
    )


@pytest.mark.valid_from("Berlin")
@pytest.mark.parametrize("first_suicide", [Op.CALL, Op.CALLCODE, Op.DELEGATECALL])
@pytest.mark.parametrize("second_suicide", [Op.CALL, Op.CALLCODE, Op.DELEGATECALL])
def test_doubleSuicide(
    env: Environment,
    yul: YulCompiler,
    fork: Fork,
    first_suicide: Op,
    second_suicide: Op,
    state_test: StateTestFiller,
):
    """
        Call|Callcode|Delegatecall the contract S.
        S selfdesturcts.
        Call the revert proxy contract R.
        R Calls|Callcode|Delegatecall S.
        S selfdestructs (for the second time).
        R reverts (including the effects of the second selfdestruct).
        It is expected the S is selfdestructed after the transaction.
    """

    address_s = "0x1000000000000000000000000000000000000001"
    address_r = "0x1000000000000000000000000000000000000002"
    suicide_d = "0x00000000000000000000000000000000000003e8"

    def construct_call_s(call_type: Op, money: int):
        if call_type in [Op.CALLCODE, Op.CALL]:
            return call_type(Op.GAS, Op.PUSH20(address_s), money, 0, 0, 0, 0)
        else:
            return call_type(Op.GAS, Op.PUSH20(address_s), money, 0, 0, 0)


    pre = {
        "0x095e7baea6a6c7c4c2dfeb977efac326af552d87": Account(
            balance=1000000000000000000,
            nonce=0,
            code = Op.SSTORE(1, construct_call_s(first_suicide, 0))
                 + Op.SSTORE(2, Op.CALL(Op.GAS, Op.PUSH20(address_r), 0, 0, 0, 0, 0))
                 + Op.RETURNDATACOPY(0, 0, Op.RETURNDATASIZE())
                 + Op.SSTORE(3, Op.MLOAD(0)),
            storage={
                0x01 : 0x0100,
                0x02 : 0x0100,
                0x03 : 0x0100
            },
        ),
        address_s: Account(
            balance=3000000000000000000,
            nonce=0,
            code=Op.SELFDESTRUCT(1000),
            storage={},
        ),
        address_r: Account(
            balance=5000000000000000000,
            nonce=0,
            # send money when calling it suicide second time to make sure the funds not transfered
            code = Op.MSTORE(0, Op.ADD(15, construct_call_s(second_suicide, 100)))
                 + Op.REVERT(0, 32),
            storage={},
        ),
        "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b": Account(
            balance=7000000000000000000,
            nonce=0,
            code="0x",
            storage={},
        ),
    }

    post = {
        # Second caller unchanged as call gets reverted
        address_r: Account(
            balance=5000000000000000000,
            storage={}
        ),
    }


    if first_suicide in [Op.CALLCODE, Op.DELEGATECALL]:
        if is_fork(fork, Cancun):
            # On Cancun even callcode/delegatecall does not remove the account, so the value remains
            post["0x095e7baea6a6c7c4c2dfeb977efac326af552d87"] = Account(
                storage={
                    0x01 : 0x01,    # First call to contract S->suicide success
                    0x02 : 0x00,    # Second call to contract S->suicide reverted
                    0x03 : 16,      # Reverted value to check that revert really worked
                },
            )
        else:
            # Callcode executed first suicide from sender. sender is deleted
            post["0x095e7baea6a6c7c4c2dfeb977efac326af552d87"] = Account.NONEXISTENT

        # Original suicide account remains in state
        post[address_s] = Account(
            balance=3000000000000000000,
            storage={}
        )
        # Suicide destination
        post[suicide_d] = Account (
            balance=1000000000000000000,
        )


    # On Cancun suicide no longer destroys the account from state, just cleans the balance
    if first_suicide in [Op.CALL]:
        post["0x095e7baea6a6c7c4c2dfeb977efac326af552d87"] = Account(
            storage={
                0x01 : 0x01,    # First call to contract S->suicide success
                0x02 : 0x00,    # Second call to contract S->suicide reverted
                0x03 : 16,      # Reverted value to check that revert really worked
            },
        )
        if is_fork(fork, Cancun):
            # On Cancun suicide does not remove the account, just sends the balance
            post[address_s] = Account(
                balance=0,
                code="0x6103e8ff",
                storage={}
            )
        else:
            post[address_s] = Account.NONEXISTENT

        # Suicide destination
        post[suicide_d] = Account (
            balance=3000000000000000000,
        )

    tx = Transaction(
        ty=0x0,
        chain_id=0x0,
        nonce=0,
        to="0x095e7baea6a6c7c4c2dfeb977efac326af552d87",
        gas_price=10,
        protected=False,
        data="",
        gas_limit=500000,
        value=0,
    )

    state_test(env=env, pre=pre, post=post, txs=[tx])
