.. _state_transition_tutorials:

###########################################
Getting Started with State Transition Tests
###########################################
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to write and execute Ethereum state transition tests. These tests can be very simple,
for example testing a single evm assembler opcode, so this is a good place to get started. This tutorial is not 
intended as a comprehensive reference, 
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
  cp ~/tests/docs/state-transition/01* .
  cd ~
  
2. The source code of tests doesn't include all the information required for the test. Instead, you run ``dretesteth.sh``,
   and it runs a client with the Ethereum Virtual Machine (evm) to fill in the values. This creates the a compiled
   version in ``tests/GeneralStateTests/stExample``.

::

  ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --filltests
  sudo chown $USER tests/GeneralStateTests/stExample/*

3. Run the regular test, with verbose output:

::

  ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --clients geth --verbosity 5

The Source Code
===============
Now that we've seen that the test works, let's go through it line by line. This test specification is written in YAML, if you
are not familiar with this format `Click here <https://www.tutorialspoint.com/yaml/index.htm>`_. 

All the fields are defined under the name of the test. Note that YAML comments start with a hash (``#``) and continue to the end of 
the line.

::

  # The name of the test
  01_add22:

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

#. Ethereum virtual machine (EVM) machine language 
#. `Lisp Like Language (lll) <http://blog.syrinx.net/the-resurrection-of-lll-part-1/>`_. One
   advantage of lll is that `it lets us use Ethereum Assembler almost directly
   <https://lll-docs.readthedocs.io/en/latest/lll_reference.html#evm-opcodes>`_.
#. `Solidity <https://cryptozombies.io/>`_, which is the standard language for Ethereum 
   contracts. Solidity is well known, but it is not ideal for VM tests because it adds a lot of its
   own code to compiled contracts.
   
The contract also has initial storage. In this case, the initial storage is empty.   

::

      095e7baea6a6c7c4c2dfeb977efac326af552d87:
        balance: '0x0ba1a9ce0ba1a9ce'

LLL code can be very low level. In this case, ``(ADD 2 2)`` is translated into three opcodes:

* PUSH 2
* PUSH 2
* ADD (which pops the last two values in the stack, adds them, and pushes the sum into the stack).

This expression ``[[0]]`` is short hand for ``(SSTORE 0 <the value at the top of the stack>)``. It
stores the value (in this case, four) in location 0. Every address in Ethereum has associated storage,
which is essentially a lookup table. `You can read more about it here 
<https://applicature.com/blog/blockchain-technology/ethereum-smart-contract-storage>`_.

::        
        
        code: |
          {
                  ; Add 2+2
                  [[0]] (ADD 2 2)
          }
        nonce: '0'
        storage: {}

This is a "user" address. As such, it does not have code. Note that you still have to specify the storage.

::

      a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
        balance: '0x0ba1a9ce0ba1a9ce'
        code: '0x'
        nonce: '0'
        storage: {}

This is the transaction that will be executed to check the code. There could be multiple transactions,
but for simplicity we just have one here, and it does not send any data. There are several important
fields here:

* ``data`` is the data we send (we need to send something)
* ``nonce`` has to be the same value as the user address
* ``to`` is the contract we are testing. If you want to create a contract, keep the 
  ``to`` definition, but leave it empty.

::

    transaction:
      data:
      - '0x10'
      gasLimit:
      - '80000000'
      gasPrice: '1'
      nonce: '0'
      to: 095e7baea6a6c7c4c2dfeb977efac326af552d87
      value:
      - '1'

This is the state we expect after running the transaction on the ``pre`` state.

::

   expect:
      - indexes:
          data: !!int -1
          gas:  !!int -1
          value: !!int -1
        network:
          - '>=Istanbul'

We expect the contract's storage to have the result, in this case 4.

::          
          
        result:
          095e7baea6a6c7c4c2dfeb977efac326af552d87:
            storage: {
                                  "0x00" : "0x04"
                  }        

Failing a Test
--------------
To verify that `retesteth` really does run tests, lets fail one. The ``02_fail`` test is almost identical to 
``01_add22``, except that it expects to see that 2+2=5. Here are the steps to use it.

1. Copy the test to the `stExample` directory 
   
::

  cp ~/tests/docs/state-transition/02* ~/tests/src/GeneralTestFiller/stExample

2. Fill the information and run the rest

::

  ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --filltests

3. Delete the test so we won't see the failure when we run future tests.

::
 
  sudo rm ~/tests/src/GeneralStateTestsFiller/stExample/02_* ~/tests/GeneralStateTests/stExample/02_*




The Compiled Test (Optional)
----------------------------
In theory you could write any test you want without understanding the compiled test format. I think it is useful
to know these things, but if you don't care about it you can skip this section.

The compiled version of our ``01_add22.yml`` is at ``tests/GeneralStateTests/stExample/add22.json``. Here it is with 
explanations:

::

  {
    "01_add22" : {

The ``_info`` section includes any comments you put in the source code of the test, as well as information about the files used to 
generate the test (the test source code, the evm compiler if any, the client software used to fill in the data, and
the tool that actually compiled the test).

::

        "_info" : {
            "comment" : "You can put a comment here",
            "filling-rpc-server" : "Geth-1.9.20-unstable-54add425-20200814",
            "filling-tool-version" : "retesteth-0.0.8-docker+commit.96775cc7.Linux.g++",
            "lllcversion" : "Version: 0.5.14-develop.2020.8.15+commit.9189ad7a.Linux.g++",
            "source" : "src/GeneralStateTestsFiller/stExample/01_add22Filler.yml",
            "sourceHash" : "6b5a88627d0b69c7f61fb05f35ac3f14066d2f4bbe248aa08c3091d7534744d8"            
        },
  
The ``env`` and ``transaction`` sections contain the same information provided in the source code. 
  
::        
        
        "env" : {
            ...
            },
        "transaction" : {
            ...
            },

The ``pre`` section contains mostly information from the source code, but any code provided source (either
LLL or Solidity) is compiled.

::

        "pre" : {
            "0x095e7baea6a6c7c4c2dfeb977efac326af552d87" : {
                "balance" : "0x0ba1a9ce0ba1a9ce",
                "code" : "0x600260020160005500",
                "nonce" : "0x00",
                "storage" : {
                }
            },
            "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b" : {
               ...
            }
        },


The ``post`` section is the situation after the test is run. This could be different for 
`different versions of the Ethereum protocol <https://en.wikipedia.org/wiki/Ethereum#Milestones>`_, 
so there is a value for every version that was checked. In this case, the only one is Istanbul.

::        

        "post" : {
            "Istanbul" : [
                {
                    "indexes" : {
                        "data" : 0,
                        "gas" : 0,
                        "value" : 0
                    },
                    
Instead of keeping the entire content of the storage and logs that are expected, it is enough to just
store hashes of them. 
                    
::

                    "hash" : "0x884b8640efb63506c2f8c2d9514335b678815e1ed362107628cf1cd6edd658c2",
                    "logs" : "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347"
                }
            ]
        }
  }
  
  Conclusion
  ==========
  At this point, if you learn `LLL <http://blog.syrinx.net/the-resurrection-of-lll-part-1/>`_ you should 
  be able to run simple tests that verify the EVM opcodes work as well as more complex algorithms
  work as expected. It is possible to write more complex tests in Solidity, but right now it is complex to
  implement them. Once the code is written to make this easier I will update the tutorial with those 
  instructions.
