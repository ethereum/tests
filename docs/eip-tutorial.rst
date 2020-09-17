.. eip-tests-tutorial:

###########################################
Testing EIPs
###########################################
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to write tests for a new EIP. We'll use
`EIP 2513 <https://eips.ethereum.org/EIPS/eip-2315>`_ as an example. It was
chosen because this EIP is already implemented by several clients,
so we'll be able to run the tests we write.


Environment and Prerequisites
=============================
Before you start, make sure you create the retesteth tutorial and create the 
environment explained there. Also make sure you read and understand the state
transition test tutorial.


Test Cases
================
The EIP includes multiple
`tests cases <https://eips.ethereum.org/EIPS/eip-2315#test-cases>`_, some valid,
some not. You can see the first test case in
`docs/tutorial_samples/07_eip2513_simple_subFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/07_eip2513_simple_subFiller.yml>`_.
The simplest way to run these test cases is to have a separate state transition
test for each one.

Normally we don't want raw
machine language code in tests if that can be avoided, so **retesteth** emits a 
warning. However, in this case we are taking the code directly from the EIP and 
provide the assembler equivalent in comments. This is the best we can do, at
least until we have compilers that support the new opcodes, so having the raw
code is justified. The **:raw** label disables the warning.

::

  pre:

    # The first valid test in EIP 2513:
    # 0 PUSH1 0x04 
    # 2 JUMPSUB 
    # 3 STOP 
    # 4 BEGINSUB
    # 5 RETURNSUB
    0x2222222222222222222222222222222222222222:
      balance: '0x0'
      code: :raw 0x60045e005c5d
      nonce: '0'
      storage: {}


To be sure that the test runs successfully, rather than appears to run successfully
because of a bug in the code that runs the test, we need to be sure of 
what happens when a test fails. To do this, I created a second contract that
always fails. It tries to run the opcode **0xFE**, which is invalid (see the 
`EVM opcode table <https://ethervm.io/#opcodes>`_). 

::

    # An invalid test. 0xFE is not a valid opcode
    0x22222222222222222222222222222222222222FE:
      balance: '0x0'
      code: :raw 0xfe
      nonce: '0'
      storage: {}


This is code that runs the tests. It uses the `Lisp Like Language
<https://lll-docs.readthedocs.io/en/latest/lll_introduction.html>`_, which
is lower level than Solidity.

The curly brackets (**{**, **}**) mean to evaluate all the expressions inside 
them in sequence. The syntax **[[n]] <expr>** means to evaluate the expression
and set storage location **n** to that value. `The opcode **call**
<https://lll-docs.readthedocs.io/en/latest/lll_reference.html#evm-opcodes>`_ calls
another contract. Taken together, this means we call the first contract 
(0x22...22) and store the result in location **1**. Then we call the second 
contract (0x22...22FE) and store the result in location **2**.

::


    # Run the two tests and store the results in the account storage
    0x1111111111111111111111111111111111111111:
      balance: 0
      code: |
        {
          [[1]] (call allgas 0x2222222222222222222222222222222222222222 0 0 0 0 0)
          [[2]] (call allgas 0x22222222222222222222222222222222222222FE 0 0 0 0 0)
        }
      nonce: 0
      storage: {}


As you can see from running the test, a successful contract call returns **1**.
A failed one either does not return a value or returns **0** (in Ethereum storage
zero and empty are the same thing).

::

  expect:
    - indexes:
        data: !!int -1
        gas:  !!int -1
        value: !!int -1
      network:
        - '>=Berlin'
      result:
        0x1111111111111111111111111111111111111111:
          storage:
            0x01: 1
            0x02: 0  # If other words, no value


You can implement the second valid test case in exactly the same way. 


Invalid Test Cases
------------------
The only difference with invalid test cases is that we store zero (or no 
value) instead of one. You can see one of those test cases in
`docs/tutorial_samples/08_eip2513_invalid_jumpFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/08_eip2513_invalid_jumpFiller.yml>`_.




Conclusion
==========
At this point you hopefully know enough to test whether a client implements an EIP
correctly or not, at least for EIPs that modify or add opcodes.

