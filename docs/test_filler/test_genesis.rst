Genesis Block
==============
This section contains the genesis block that starts the chain being tested.


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
                 genesisBlockHeader: {
                     fields go here
                 }
              }
           }

     -

       ::

           name-of-test:
              <other sections>
              genesisBlockHeader:
                 fields go here     


Fields
------
`You can read the definition of Ethereum block header fields here
<https://medium.com/@derao512/ethereum-under-the-hood-part-7-blocks-7f223510ba10>`_.
