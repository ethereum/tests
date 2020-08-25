.. blockchain-tests-tutorial:

###########################################
Getting Started with Blockchain Tests
###########################################
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to use the skills you learned writing state tests to write
blockchain tests. These tests can include multiple blocks and each of those blocks can include
multiple transactions.

The Environment
===============
Before you start, make sure you read and understand the `Getting Started with Retesteth 
<https://github.com/ethereum/retesteth/blob/develop/docs/gettingStarted.md>`_ document, and
create the environment explained there. Also make sure you read and understand `Getting 
Started with State Tests <http://www.google.com>`_?

.. GOON add the URL of the getting started tutorial.


Types of Blockchain Tests
=========================
If you go to ``tests/src/BlockchainTestsFiller`` you will see three different directories.

1. ``ValidBlocks`` are tests that only have valid blocks, which the client should accept.
2. ``InvalidBlocks`` are tests that should raise an exception because they include invalid blocks.
3. ``TransitionTests`` are tests that verify the transitions between different versions of the 
   Ethereum protocol (called `forks <https://medium.com/mycrypto/the-history-of-ethereum-hard-forks-6a6dae76d56f>`_) 
   are handled correctly. These tests are very important, but the people who write them are typically the 
   people who write the tests software so I am not going to explain them here.
   

Valid Block Tests
=================
Copy GOON: File name to `tests/src/BlockchainTestsFiller/ValidBlocks/

  
Conclusion
==========
At this point you should be able to run simple tests that verify the EVM opcodes work as well as more 
complex algorithms work as expected. You are, however, limited to a single transaction in a single block.
In a future tutorial you will learn how to write blockchain tests that can involve multiple blocks, each
of which can have multiple transactions.
