.. eip-tests-tutorial:

###########################################
Testing EIPs
###########################################
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to write tests for a new EIP 
(after the EIP itself has been implemented on a branch of geth).


Environment
===========
The easiest way to do this is to run **restetheth** `in a docker container you build <retesteth-tutorial.html#using-the-latest-version>`_.
To be able to isolate problems, it is best if the docker container includes both the branch geth and the standard one.

#. Get the **Dockerfile** and the script:

   ::

      mkdir ~/retestethBuild
      cd ~/retestethBuild
      wget https://raw.githubusercontent.com/ethereum/retesteth/develop/dretesteth.sh
      chmod +x dretesteth.sh
      wget https://raw.githubusercontent.com/ethereum/retesteth/develop/Dockerfile

#. Edit **Dockerfile**:

   * In the last line of the string of commands that builds **geth**, remove the ** && rm -rf /usr/local/go**.
     We are going to need **geth** again in a moment.

      ::

         RUN cd /geth && apt-get install wget \
           && wget https://dl.google.com/go/go1.18.linux-amd64.tar.gz \
           && tar -xvf go1.18.linux-amd64.tar.gz \
           && mv go /usr/local && ln -s /usr/local/go/bin/go /bin/go \
           && make all && cp /geth/build/bin/evm /bin/evm \
           && cp /geth/build/bin/geth /bin/geth \
           && rm -rf /geth  

   * Duplicate the **geth** commands, except for these changes:
    
      * Clone a repository that includes the modified geth (it may be a branch of the main geth repository, or a different repository alltogether).
      * Change the directory as needed by the repository.
      * Remove the code that installs the Go programming language.
      * Change the binaries to go to /usr/local/bin.

      |

      For example, here is `Optimism's version of geth <https://github.com/ethereum-optimism/optimism/tree/develop/l2geth>`_.
      These are the commands to install and compile it:

      ::

          RUN git clone --depth 1 -b develop https://github.com/ethereum-optimism/optimism.git /geth
          RUN cd /geth/l2geth && apt-get install wget \
              && make all && cp /geth/l2geth/build/bin/evm /usr/local/bin/evm \
              && cp /geth/l2geth/build/bin/geth /usr/local/bin/geth \
              && rm -rf /geth && rm -rf /usr/local/go

#. Issue **./dretesteth.sh build**.

#. Run at least one test to initialize the **tests/config** directory.

#. To make life easier, change the ownership of those files:

   ::

      sudo find tests/config -exec chown `whoami` {} \;


#. Copy the **t8ntool* configuration to **t8ntool-eip**:

   ::
   
      cd tests/config
      cp -R t8ntool/ t8ntool-eip

#. Edit **t8ntool-eip/start.sh** to use the modified **evm** binary:

   ::

      if [ $stateProvided -eq 1 ]; then
          /bin/evm-eip t8n ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9} ${10} ${11} ${12} ${13} ${14} ${15} ${16$
      else
          /bin/evm-eip t9n ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9} ${10} ${11} ${12} ${13} ${14} ${15} ${16$
      fi



Test Cases
================
The EIP includes multiple
`tests cases <https://eips.ethereum.org/EIPS/eip-2315#test-cases>`_, some valid,
some not. You can see the first test case in
`docs/tutorial_samples/07_eip2315_simple_subFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/07_eip2315_simple_subFiller.yml>`_.
The simplest way to run these test cases is to have a separate state transition
test for each one.

To run this test case, execute these commands:

::

   cd ~
   cp tests/docs/tutorial_samples/07* tests/src/Gen*/stExample
   ./dretesteth.sh -t GeneralStateTests/stExample -- \
        --singletest 07_eip2315_simple_sub --vmtrace --testpath ~/tests \
        --datadir /tests/config --filltests


The Test Source
---------------
Normally we don't want raw
machine language code in tests if that can be avoided, so **retesteth** emits a 
warning. However, in this case we are taking the code directly from the EIP and 
provide the assembler equivalent in comments. This is the best we can do, at
least until we have compilers that support the new opcodes, so having the raw
code is justified. The **:raw** label disables the warning.

::

  pre:

    # The first valid test in EIP 2315:
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
`docs/tutorial_samples/08_eip2315_invalid_jumpFiller.yml
<https://github.com/ethereum/tests/blob/develop/docs/tutorial_samples/08_eip2315_invalid_jumpFiller.yml>`_.

::

   cd ~
   cp tests/docs/tutorial_samples/08* tests/src/Gen*/stExample
   ./dretesteth.sh -t GeneralStateTests/stExample -- \
        --singletest 08_eip2315_invalid_jump --vmtrace --testpath ~/tests \
        --datadir /tests/config --filltests


How Does It Work?
=================
The explanation here is for this command:

::

   ./dretesteth.sh -t GeneralStateTests/stExample -- \
        --singletest 08_eip2315_invalid_jump --vmtrace --testpath ~/tests \
        --datadir /tests/config --filltests

However, any similar command would work the same way.


#. The **dretesteth.sh** script runs **retesteth** inside a docker container. 

#. This **retesteth** sees the **-\\-filltests** command line flag, so it knows the test
   is a source file that needs to be filled with additional information. 

   Based on the command line, the complete file name is 
   **tests/src/GeneralStateTestsFiller/stExample/08_eip2315_invalid_jumpFiller.<format>**:

   - Source files are under **tests/src**. 

   - The **-t GeneralStateTests/stExample** parameter means that the directory inside
     it is **GeneralStateTestsFiller/stExample**. 
   
   - The **-\\-singletest 08_eip2315_invalid_jump** parameter means that the 
     file inside that directory is either **08_eip2315_invalid_jumpFiller.json** or
     **08_eip2315_invalid_jumpFiller.yml**, depending on the format.

#. The **retesteth** in the docker reads this file. `You can see the format of this
   file here
   <https://ethereum-tests.readthedocs.io/en/latest/test_filler/state_filler.html>`_.

#. The **retesteth** in the docker container runs a client (**geth**, which is also
   in the docker) and receives from it additional information.

#. The filled test with the complete information is written to
   **tests/GeneralStateTests/stExample/08_eip2315_invalid_jump.json**. `Click here 
   to read about the format of filled tests files
   <https://ethereum-tests.readthedocs.io/en/latest/test_types/gstate_tests.html>`_.
   
#. In the future you can run this test without **-\\-filltests** and it would
   use **tests/GeneralStateTests/stExample/08_eip2315_invalid_jump.json**. 

   :: 
   
       ./dretesteth.sh -t GeneralStateTests/stExample -- \
           --singletest 08_eip2315_invalid_jump --vmtrace --testpath ~/tests \
           --datadir /tests/config






Conclusion
==========
At this point you should know enough to test whether a client implements an EIP
correctly or not, at least for EIPs that modify or add opcodes.

