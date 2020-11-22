Transaction
=============

This is the data of the transaction.


Format
------------


.. list-table::
   :header-rows: 1

   * - JSON

     - YAML

   * -

       ::

           {
               "name-of-test": {
                  <other sections>,
                  "transaction":
                     {
                        "data": ["0xDA7A", "0xDA7A", ":label hex 0xDA7A", ":abi f(uint) 0xDA7A"],
                        "gasLimit": ["0x6a506a50"],
                        "gasPrice: 1,
                        "value": ["1"],
                        "to": "add13ess01233210add13ess01233210",
                        "secretKey": "5ec13e7 ... 5ec13e7"
                        "nonce": '0x909ce'
           }

     - ::

           name-of-test:
             <other sections>
             transaction:
               data:
               - 0xDA7A
               - 0xDA7A
               - :label hex 0xDA7A
               - :abi f(uint) 0xDA7A
               gasLimit:
               - '0xga50ga50'
               gasPrice: "1"
               value: 
               - "1"
               to: "add13ess01233210add13ess01233210"
               secretKey: "5ec13e7 ... 5ec13e7"
               nonce: '0x909ce'


Fields
--------------
- **data**:

  The data, either in hexadecimal or an 
  `ABI call <https://solidity.readthedocs.io/en/v0.7.1/abi-spec.html>`_
  with this format:
  **:abi <function signature> <function parameters separated by spaces>**.
  The value can also be labeled:
  **:label <value>**. 
  This value is specified as a list to enable
  `files with multiple tests <../state-transition-tutorial.html#multitest-files>`_

- **gasLimit**:
  
  Gas limit for the transaction.
  This value is specified as a list to enable
  `files with multiple tests <../state-transition-tutorial.html#multitest-files>`_


- **gasPrice**:

  Gas price in Wei


- **value**:

  The value the transaction transmits in Wei.
  This value is specified as a list to enable
  `files with multiple tests <../state-transition-tutorial.html#multitest-files>`_


- **to**:

  The destination address, typically a contract


- **secretKey**:

  The secret key for the sending address. That address is derived from the
  secret key and therefore does not need to be specified explicitely
  (`see here 
  <https://www.freecodecamp.org/news/how-to-create-an-ethereum-wallet-address-from-a-private-key-ae72b0eee27b/>`_). 


- **nonce**:

  The nonce value for the transaction. The first transaction for an address
  has the nonce value of the address itself, the second transaction has the
  nonce plus one, etc.
