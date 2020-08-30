.. _blockchain_filler:

=================================
Blockchain Tests (Filler version)
=================================
Location: `/BlockchainTestsFiller
<https://github.com/ethereum/tests/tree/develop/src/BlockchainTestsFiller>`_

Blockchain tests can include multiple blocks and each of those blocks can include 
multiple transactions. These blocks can be either valid or invalid.



Subfolders
==========

================= ========================================
InvalidBlocks     Tests containing blocks that are expected to fail on import
ValidBlocks       Normal blockchain tests
TransitionTests   Blockchain tests with exotic network rules switching forks at block #5
================= ========================================

.. _struct_bctest:
.. include:: ../test_filler/test_structure.rst


.. _struct_genesis:
.. include:: ../test_filler/test_genesis.rst


.. _struct_expect:
.. include:: ../test_filler/test_expect.rst


.. _struct_pre:
.. include:: ../test_filler/test_pre.rst


.. _struct_blocks:
.. include:: ../test_filler/test_blocks.rst
