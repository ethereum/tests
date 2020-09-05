.. _vm_filler:

=================================
Virtual Machine Tests
=================================
Location: `src/VMTestsFiller
<https://github.com/ethereum/tests/tree/develop/src/VMTestsFiller>`_

Virtual machine tests check a single instance of EVM execution, with one stack
and one memory space. They are similar to state transition tests, but even 
simpler.


.. _vm_struct:
.. include:: ../test_filler/test_structure.rst


.. _vm_env:
.. include:: ../test_filler/test_env.rst


.. _vm_pre:
.. include:: ../test_filler/test_pre.rst


.. _vm_exec:
.. include:: ../test_filler/test_exec.rst


.. _vm_expect:
.. include:: ../test_filler/test_expect_vm.rst

