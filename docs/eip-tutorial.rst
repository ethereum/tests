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
transition and blockchain tests tutorials.



Valid Test Cases
================
The EIP includes two 
`successful tests cases <https://eips.ethereum.org/EIPS/eip-2315#test-cases>`_.
Both tests produce no output and the only state change they cause is a cost in
gas. To see these two test cases tested, run these commands:

::

  cd ~
  cp tests/docs/tutorial_samples/07_eip2513_validFiller.yml \
     tests/src/BlockchainTestsFiller/ValidBlocks/bcExample
  ./dretesteth.sh -t BlockchainTests/ValidBlocks/bcExample -- \
        --singletest 07_eip2513_valid --testpath ~/tests \
        --datadir /tests/config --filltests


The test file is at `docs/tutorial_samples/07_eip2513_validFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/07_eip2513_validFiller.yml>`_.
Here is an explanation of the relevant lines.

This is the first test case. 

::

  pre:

  # First example at https://eips.ethereum.org/EIPS/eip-2315#test-cases.
    0x1111111111111111111111111111111111111111:
      balance: 0
      nonce: 0
      storage: {}


.. note:: 

   If you just put raw machine language code in the **code:** section it is 
   difficult for people to understand what you did. In this case it makes sense
   to put raw machine language we got from the EIP, but you should have a 
   comment giving the assembly that produced this code.

:: 

      code: :raw 0x60045e005c5d


This is the second test case. The addresses, **0x111...111** and **0x222...222**, 
were chosen specifically to make it clear which test case we're using or calling.

::

    0x2222222222222222222222222222222222222222:
      balance: 0
      nonce: 0
      storage: {}
      code: :raw 0x6800000000000000000c5e005c60115e5d5c5d


We need two different user accounts, because each will call a single test
case. This was we can see how each test case affects the account balance.

:: 

    0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B:
      balance: 1000000000000000000
      nonce: 0
      code: ''
      storage: {}

    0xd02d72E067e77158444ef2020Ff2d325f929B363:
      balance: 1000000000000000000
      nonce: 0
      code: ''
      storage: {}


It is easiest to encode the call as a single block that has two transations.
Remember that in a blockchain test **blocks:** and **transactions:** are both
lists.

::

  blocks:
  - transactions:
    - data: ''
      gasLimit: 50000
      gasPrice: 1
      nonce: 0



.. note:: 

   To make your tests clearer, add a comment above each **secretKey:** field
   with the corresponding account address.

::

      secretKey: 45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8
      to: 0x1111111111111111111111111111111111111111
      value: 0

    - data: ''
      gasLimit: 50000
      gasPrice: 1
      nonce: 0
      secretKey: 41f6e321b31e72173f8ff2e292359e1862f24fba42fe6f97efaf641980eff298
      to: 0x2222222222222222222222222222222222222222
      value: 0



The only effect we can test is the gas cost. In the Berlin fork, that gas cost is
**21000+<cost of the contract code>**. We start the "user" accounts with 1 ETH
(:math:`{10}^{18}` Wei, the unit used in test files). This is the balance that 
remains after the transaction.

::

  expect:
  - network:
    - Berlin
    result:
      0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B:
        balance: 999999999999978982
      0xd02d72E067e77158444ef2020Ff2d325f929B363:
        balance: 999999999999978964


.. note::

   Instead of calclating the balances by hand you can specify the wrong
   value, for example 0.

   ::

     expect:
     - network:
       - Berlin
       result:
         0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B:
            balance: 0
         0xd02d72E067e77158444ef2020Ff2d325f929B363:
            balance: 0

   And then run the test. The errors tell you the correct values:

   ::

     Error: Check State: Remote account '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b': 
     has incorrect balance '999999999999978982', test expected '0' 
     (0x0de0b6b3a763ade6 != 0x00) (bcExample/07_eip2513_valid_Berlin, 
     fork: Berlin, chain: default, block: 1)
     Error: Check State: Remote account '0xd02d72e067e77158444ef2020ff2d325f929b363': 
     has incorrect balance '999999999999978964', test expected '0' 
     (0x0de0b6b3a763add4 != 0x00) (bcExample/07_eip2513_valid_Berlin, 
     fork: Berlin, chain: default, block: 1)


Writing Your Own Tests
==========================
In this case the EIP includes test cases. We are not always so fortunate,
sometimes we need to write them ourselves. The exact method to write them depends
on what we need to test. In this case the EIP creates new opcodes, so we need 
to write machine language code that uses those opcodes. Because they are new,
presumably we can't rely on a compiler to generate it for us.

Using the `EVM opcode table <https://ethervm.io/#opcodes>`_, we can write our
own EVM assembler program. I prefer to use storage to see what happened in
in a test case, so this program is going to do that. If the program's different 
pieces are executed in the correct order, storage addresses **0**, **1**, 
and **2** should all have the value **255**.

::

   PUSH1 0xFF
   PUSH1 0
   SSTORE   # storage[0] <- 0xFF
   PUSH1 <label>
   JUMPSUB   
   PUSH1 1
   SLOAD # stack <- storage[1], which should be 0xFF
   PUSH1 2
   SSTORE # storage[2] <- storage[1]
   STOP
   label:    # We'll calculate this value later
   BEGINSUB 
   PUSH1 0
   SLOAD # stack <- storage[0], which should be 0xFF
   PUSH1 1
   SSTORE # storage[1] <- storage[0]
   RETURNSUB

Now that we have the assembler program, the next step is to convert it to 
machine language. It is easiest to do this as a table with each operation 
getting its own row. These opcodes take one byte each, except for 
**PUSH1** which takes two, one for itself and one for the one byte value
being pushed.

=============== ============== ================ ===========
Program Counter Operation      Machine Language Comment
=============== ============== ================ ===========
              0 PUSH1 0xFF     60 FF
              2 PUSH1 0        60 00
              4 SSTORE         55               storage[0] <- 0xFF
              5 PUSH1 <label>  60 ??            We don't know this value yet
              7 JUMPSUB        5E   
              8 PUSH1 1        60 01
             10 SLOAD          54               stacktop <- storage[1]
             11 PUSH1 2        60 02            
             13 SSTORE         55               storage[2] <- stacktop (storage[1])
             14 STOP           00               We're done
             15 BEGINSUB       5C               Here we see the label value is 15 (0x0F)
             16 PUSH1 0        60 00
             18 SLOAD          54               stacktop <- storage[0]
             19 PUSH1 1        60 01     
             21 SSTORE         55               storage[1] <- stacktop (storage[0])
             22 RETURNSUB      5D
=============== ============== ================ ===========


If we put all these values together and use the value of the label (which is the 
program counter for **BEGINSUB**, 15 = 0x0F), we get this code:

:: 

   :raw 0x60ff600055600f5e600154600255005c6000546001555d

You can see the test file at 
`docs/tutorial_samples/08_eip2513_own_testFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/08_eip2513_own_testFiller.yml>`_.
It is mostly straightforward except that I had to increase **gasLimit** for the blocks
(in the **genesisBlockHeader:**) and for the transaction itself. Writing to storage is 
an expensive operation.

.. note::
   This kind of hand assembly is error prone. You can use **--vmtrace** to be able 
   to see what is happening to debug it. Also, once **lllc** supports the new opcode
   it is best to modify the test to use that - it is a lot more readable.


Invalid Test Cases
==================
The EIP includes several
`failure tests cases <https://eips.ethereum.org/EIPS/eip-2315#failure-1-invalid-jump>`_.
To check if a transaction ran we can **SSTORE** a value when we start the case. 
If the transaction ends correctly, that new value will be in the storage. If the 
VM stops with an error, storage is unchanged.

The machine language code to put a value of **0xFF** into location **0** of the storage
is:

=============== ============== ================ ===========
Program Counter Operation      Machine Language Comment
=============== ============== ================ ===========
              0 PUSH1 0xFF     60 FF
              2 PUSH1 0        60 00
              4 SSTORE         55               storage[0] <- 0xFF
=============== ============== ================ ===========

So if the a test case does not have jumps to fixed addresses (or 
calls fixed addresses of subroutines), we can simply start it with
**0x60FF600055**. If the code is successful, we'll see **0xFF** in location
**0**. Otherwise, we'll see whatever value was there previously.

When we add this to the invalid test cases we get:

==================== ==================================================
Test Case            Code
==================== ==================================================
Invalid Jump         0x60ff6000556801000000000000000c5e005c60115e5d5c5d
Shallow Return Stack 0x60ff6000555d5858
Walk into Subroutine 0x60ff6000555c5d00
==================== ==================================================


This leaves us with one final test case, a jump to a subroutine at the end of the
code. That is not actually an invalid test case, it just means that 
when the subroutine ends so does the code. Undefined code is assumed to be 
**0x00**, which is conveniently the **STOP** opcode.

However, that test includes
addresses that we need to recalculate if we are going to add bytes.
Here is that test case, modified for the new addresses.

=============== ============== ================ ===========
Program Counter Operation      Machine Language Comment
=============== ============== ================ ===========
              0 PUSH1 0xFF     60 FF
              2 PUSH1 0        60 00
              4 SSTORE         55               storage[0] <- 0xFF
              5 PUSH1 post-sub 60 0A
              7 JUMP           56
              8 BEGINSUB       5C               This is the address sub
              9 RETURNSUB      5D
             10 JUMPDEST       5B               This is the address post-sub
             11 PUSH1 sub      60 08
             13 JUMPSUB        5E
=============== ============== ================ ===========

You can see all of these test cases in 
`docs/tutorial_samples/09_eip2513_invalidFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/09_eip2513_invalidFiller.yml>`_.
The contract accounts start with storage location **0** having the value **1** so we can
check if that value stayed there.

Note that even though these are invalid test cases, this test belongs in 
**Blockchaintests/ValidBlocks/bcExample**. While some of the transactions fail and 
revert, the blocks themselves are perfectly valid and should be accepted by the 
client. Also, it is a problem for an account to have multiple transactions in the 
same block, so for four transactions we use two accounts and two blocks.



Conclusion
==========
At this point you hopefully know enough to test whether a client implements an EIP
correctly or not.

