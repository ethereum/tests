.. _gstate_tests:

General State Test
------------------

Location `/GeneralStateTests <https://github.com/ethereum/tests/tree/develop/GeneralStateTests>`_


Test Structure
==============

Contains **transactions** that are to be executed on a state **pre** given the environment **env** and must end up with post results **post**

Although its a simple transaction execution on stateA to stateB, due to the generation of this tests into blockchain format, the transaction execution is performed as if it was a single block with single transaction. This means that mining reward and touch rules after EIP-161 are applied. (mining reward is 0)


* A test file must contain **only one** test `testname`
* Test file name must be **identical** for the test name `testname`


::

  {
    "testname" : {
      "_info" : { ... },
      "env" : { ... },
      "post" : { ... },
      "pre" : { ... },
      "transaction" : { ... }
    }
  }

.. include:: ../test_types/TestStructures/info.rst
.. include:: ../test_types/TestStructures/GeneralStateTests/env.rst
.. include:: ../test_types/TestStructures/GeneralStateTests/post.rst
.. include:: ../test_types/TestStructures/pre.rst
.. include:: ../test_types/TestStructures/GeneralStateTests/transaction.rst