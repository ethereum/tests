
Using Testeth
=============

Ethereum cpp-client testeth tool for creation and execution of ethereum tests.

To run tests you should open folder (see also `Installing and building <http://www.ethdocs.org/en/latest/ethereum-clients/cpp-ethereum/index.html#installing-and-building>`_
in ``cpp-ethereum`` docs)

   ``/build/libethereum/test``

and execute a command ``./testeth`` This will run all test cases automatically.
To run a specific test case you could use parameter ``-t`` in the command line option:

    ``./testeth -t <TEST_SUITE>/<TEST_CASE>``

Or just the test suite:

   ``./testeth -t <TEST_SUITE>``

You could also use ``--filltests`` option to rerun test creation from .json files which are located at ``../cpp-ethereum/test/<TEST_FILLER>.json``

    ``./testeth -t <TEST_SUITE>/<TEST_CASE> --filltests``

By default using ``--filltests`` option ``testeth`` recreate tests to the ``ETHEREUM_TEST_PATH`` folder. You might want to set this variable globally on your system like:

|    ``nano /etc/environment``
|    ``ETHEREUM_TEST_PATH="/home/user/ethereum/tests"``
|

Filler files are test templates which are used to fill initial parameters defined at test specification :ref:`ethereum_tests` and then create a complete test ``.json`` file. You might find filler files very useful when creating your own tests.

The ``--checkstate`` option adds a BOOST error if the post state of filled test differs from its ``expected`` section.

To specify a concrete test in a TEST_CASE file for filling/running procedure use ``--singletest`` option:

    ``./testeth -t <TEST_SUITE>/<TEST_CASE> --singletest <TEST_NAME>``

If you want to debug (note: testeth should be build with VMTRACE=1) a single test within a result test ``.json`` file, you might use the following command:

|    ``./testeth --log_level=test_suite --run_test=<TEST_SUITE>/<TEST_CASE> --singletest <TEST_FILE>.json``
| 	 ``<TEST_NAME> --vmtrace --verbosity 12``
|    or
|    ``./testeth -t <TEST_SUITE>/<TEST_CASE> --singletest <TEST_NAME> --vmtrace --verbosity 12``
|

Some tests may use excessive resources when running, so by default they are disabled. Such tests require specific flag to be set in order to be executed. Like ``--performance``, ``--inputLimits``, ``--memory``, ``--quadratic``. You may also enable all of the tests by setting ``--all`` flag. Be careful. Enabled memory tests may stress your system to use 4GB of RAM and more.

That's it for test execution. To read more about command line options you may run ``testeth`` with ``--help`` option.

Now let's see what test cases are available.

Test Cases
----------

Almost each test case has its filler file available at ``/webthree-umbrella/libethereum/test``

TEST_SUITE = BlockTests
TEST_CASES = blValidBlockTest blInvalidTransactionRLP blTransactionTest blInvalidHeaderTest userDefinedFile

TEST_SUITE = TransactionTests
TEST_CASES = ttTransactionTest ttWrongRLPTransaction tt10mbDataField userDefinedFile

TEST_SUITE = StateTests
TEST_CASES = stExample stSystemOperationsTest stPreCompiledContracts stLogTests stRecursiveCreate stTransactionTest stInitCodeTest stSpecialTest stRefundTest stBlockHashTest stQuadraticComplexityTest stSolidityTest stMemoryTest stCreateTest userDefinedFileState

TEST_SUITE = VMTests
TEST_CASES = vm_tests vmArithmeticTest vmBitwiseLogicOperationTest vmSha3Test vmEnvironmentalInfoTest vmBlockInfoTest vmIOandFlowOperationsTest vmPushDupSwapTest vmLogTest vmSystemOperationsTest vmPerformanceTest vmInputLimitsTest1 vmInputLimitsTest2 vmRandom userDefinedFile
