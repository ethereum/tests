.. _getting_started:

###############
Getting Started
###############
`Ori Pomerantz <mailto://qbzzt1@gmail.com>`_

In this tutorial you learn how to write and execute Ethereum tests. It is not intended as a comprehensive reference, 
`click here to access the reference material <https://ethereum-tests.readthedocs.io/en/latest/>`_

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
  cp ../stShift/*.yml .
  cd ~
  
2. The source code of tests doesn't include all the information required for the test. Instead, you run the test against
   a known good copy of ``geth`` and fill in those values. After you create the file change the ownership to your normal
   user

::

  sudo ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --filltests --clients geth
  sudo chown $USER tests/GeneralStateTests/stExample/*

3. Run the regular test, with verbose output:

::

  sudo ./dretesteth.sh -t GeneralStateTests/stExample -- --testpath ~/tests --datadir /tests/config --clients geth --verbosity 5
