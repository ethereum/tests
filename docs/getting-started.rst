.. _getting_started:

###############
Getting Started
###############
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to write and execute Ethereum tests. It is not intended as a comprehensive reference, 
`click here to access the reference material <https://ethereum-tests.readthedocs.io/en/latest/>`_.

The Environment
===============
Before you start, make sure you read and understand the `Getting Started with Retesteth 
<https://github.com/ethereum/retesteth/blob/develop/docs/gettingStarted.md>`_ document, and
create the environment explained there.


Compiling Your First Test
=========================
Before we get into how tests are built, lets compile and run a simple one.

1. The source code of the tests is in ``tests/src``. It is complicated to add another tests directory, so we will use
   ``GeneralStateTestsFiller/stExample``.
   
::

  cd tests/src/GeneralTestsFiller/stExample
  cp ~/tests/docs/getting-started/01* .
  cd ~
  
2. The source code of tests doesn't include all the information required for the test. Instead, you run the test against
   a known good copy of ``geth`` and fill in those values. After you create the file change the ownership to your normal
   user.

::

  sudo ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --filltests --clients geth
  sudo chown $USER tests/GeneralStateTests/stExample/*

3. Run the regular test, with verbose output:

::

  sudo ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --clients geth --verbosity 5

The Source Code
===============
Now that we've seen that the test works, let's go through it line by line. This test specification is written in YAML, if you
are not familiar with this format `Click here <https://www.tutorialspoint.com/yaml/index.htm>`_. 

All the fields are defined under the name of the test. Note that YAML comments start with a hash (``#``) and continue to the end of 
the line.

::

  # The name of the test
  add22:

This is the general Ethereum environment before the transaction:

::

  env:
      currentCoinbase: 2adc25665018aa1fe0e6bc666dac8fc2697ff9ba
      currentDifficulty: '0x20000'
      currentGasLimit: "100000000"
      currentNumber: "1"
      currentTimestamp: "1000"
      previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6


This is where you put human readable information. In contrast to ``#`` comments, these comment fields get
copied to the compiled JSON file for the test.

::

    _info:
      comment: "You can put a comment here"
  
These are the relevant addresses and their initial states before the test starts:
  
::      

    pre:


This is a contract address. As such it has code, which can be in one of three formats:

#. Ethereum virtual machine (EVM) binary code 
#. `Lisp Like Language (lll) <http://blog.syrinx.net/the-resurrection-of-lll-part-1/>`_. One
   advantage of lll is that `it lets us use Ethereum Assembler almost directly
   <https://lll-docs.readthedocs.io/en/latest/lll_reference.html#evm-opcodes>`_.
#. `Solidity <https://blockgeeks.com/guides/solidity/>`_, which is the standard language for Ethereum 
   contracts. Solidity is well known, but it is not ideal for VM tests because it adds a lot of its
   own code to compiled contracts.
   
The contract also has initial storage. In this case, the initial storage is empty.   

::

  # Describe an address
      095e7baea6a6c7c4c2dfeb977efac326af552d87:
        balance: '0x0ba1a9ce0ba1a9ce'
        code: |
          {
                  ; Add 2+2
                  [[0]] (ADD 2 2)
          }
        nonce: '0'
        storage: {}


  # Another address, this one belongs to a user
      a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
        balance: '0x0ba1a9ce0ba1a9ce'
        code: '0x'
        nonce: '0'
      
  # The transaction to check
    transaction:
      data:
      - ''
      gasLimit:
      - '80000000'
      gasPrice: '1'

  # Must be the same nonce as the user address (a94f...)
      nonce: '0'

  # The contract we are testing. If this field is empty the transaction becomes
  # contract creation
      to: 095e7baea6a6c7c4c2dfeb977efac326af552d87
      value:
      - '1'

  # The expected result
    expect:
      - indexes:
          data: !!int -1
          gas:  !!int -1
          value: !!int -1
        network:
          - '>=Istanbul'
        result:
          095e7baea6a6c7c4c2dfeb977efac326af552d87:
            storage: {
                                  "0x00" : "0x04"
                  }        
