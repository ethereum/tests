Blocks
======
This section contains the blocks of the blockchain that are supposed to modify the
state from the one in the **pre** section to the one in the **expect** section.


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
                 blocks: [
                   { transactions: [
                       { <transaction> },
                       { <transaction> }
                     ]
                   },
                   { transactions: [
                       { <transaction> },
                       { <transaction> }
                     ]
                     blockHeader: { <block header fields> },
                     uncleHeaders: [<hash>, <hash>]
                   }
                 ]
              }
           }          


     -

       ::

           name-of-test:
              <other sections>
              blocks:
              - transactions:
                - <transaction>
                - <transaction>
              - blockHeader:
                  <block header fields>
                uncleHeaders:
                - <hash>
                - <hash>
                transactions:
                - <transaction>
                - <transaction>

Fields
------
The fields in each block are optional. Only include those fields you need.

- **blockHeader**:

  This field contains the block header parameters. Parameters that are missing are
  copied from the genesis block.
  `You can read the definition of Ethereum block header fields here
  <https://medium.com/@derao512/ethereum-under-the-hood-part-7-blocks-7f223510ba10>`_.

  One field inside the block header which is not standard in Ethereum is 
  **expectException**. That field, which is only used in invalid block tests,
  identifies the exception we expect to receive for the block on different
  forks of Ethereum. You can read more about it in the `Invalid Block Tests 
  section of the Blockchain Tests 
  tutorial <../blockchain-tutorial.html#invalid-block-tests>`_.

- **uncleHeaders**:

  A list of `uncle blocks (blocks mined at the same time) 
  <https://www.investopedia.com/terms/u/uncle-block-cryptocurrency.asp>`_.

- **transactions**:

  A list of transaction objects in the block. 
