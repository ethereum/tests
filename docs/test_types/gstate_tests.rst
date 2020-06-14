.. _gstate_tests:

General State Test
------------------

Test Structure
==============

Contains **transactions** that are to be executed on a state **pre** given the environment **env** and must end up with post results **post**

* A test file must contain **only one** test `testname`
* Test file name must be **identical** for the test name `testname`


::

  {
    "testname" : {
      "env" : {},
      "post" : {},
      "pre" : {},
      "transaction" : {}
    }
  }

.. include:: ../test_types/TestStructures/GeneralStateTests/env.rst
.. include:: ../test_types/TestStructures/GeneralStateTests/post.rst
.. include:: ../test_types/TestStructures/pre.rst
.. include:: ../test_types/TestStructures/GeneralStateTests/transaction.rst