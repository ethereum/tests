Transaction
=============

This is the data of a transaction. Every block contains a list of transactions


Format
------------


.. list-table::
   :header-rows: 1

   * - JSON

     - YAML

   * -

       ::

           {
               "name-of-test":
               { 
                  <other sections>
                  "blocks": [
                     { 
                       transactions: [
                         {
                           data: "0xDA7A",
                           gasLimit: "0x6a506a50",
                           gasPrice: 1,
                           value: 1,
                           to: "add13ess01233210add13ess01233210",
                           secretKey: "5ec13e7 ... 5ec13e7"
                           nonce: '0x909ce'
                         },
                         <other transactions>
                       ]
                       <other block fields>
                     },
                     <other blocks>
                  ]
              }


     - ::

           <test-name>:
             <other sections>
             blocks:
             - transactions:
               - data: 0xDA7A
                 gasLimit: '0x6a506a50'
                 gasPrice: "1"
                 value: 1
                 to: "add13ess01233210add13ess01233210"
                 secretKey: "5ec13e7 ... 5ec13e7"
                 nonce: '0x909ce'
               - <another transaction>
               <other block fields>
             - <another block>


Fields
--------------
- **data**:

  The data, either in hexadecimal or an 
  `ABI call <https://solidity.readthedocs.io/en/v0.7.1/abi-spec.html>`_
  with this format:
  **:abi <function signature> <function parameters separated by spaces>**.


- **gasLimit**:
  
  Gas limit for the transaction


- **gasPrice**:

  Gas price in Wei


- **value**:

  The value the transaction transmits in Wei


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
  nonce plus one, etc. Alternatively, if you replace all the **nonce** values
  with **auto**, the tool does this for you.
