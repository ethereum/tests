Env Block
==============
This section contains the environment, the block just before the one that runs
the VM or executes the transaction.

Format
------

.. list-table::
   :header-rows: 1

   * - JSON

     - YAML

   * -

       ::

           {
              "name-of-test": {
                 <other sections>,
                 env: {
                     fields go here
                 }
              }
           }

     -

       ::

           name-of-test:
              <other sections>
              env:
                 fields go here     


Fields
------
`You can read the definition of Ethereum block header fields here
<https://medium.com/@derao512/ethereum-under-the-hood-part-7-blocks-7f223510ba10>`_.

Note that this section only contains the fields that are relevant to single
transaction tests.

=================== ========================
Name in Env Section Meaning
=================== ========================
currentCoinbase     beneficiary of mining fee
currentDifficulty   difficulty of previous block
currentGasLimit     limit of gas usage per block
currentNumber       number of ancestory blocks
currentTimestamp    `Unix time <https://en.wikipedia.org/wiki/Unix_time>`_
previousHash        hash of previous block
=================== ========================
