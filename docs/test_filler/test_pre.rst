Pre
======
This section contains the initial information of the blockchain.



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
                 "pre": {
                    "address 1": {
			"balance": 0xba1a9ce000,
			"nonce": 0,
			"code": ":raw 0x600160010160005500"
			"storage: {
				"0x0":  "0x12345",
				"0x12": "0x121212"
                    },
                    "address 2": {
                        <account fields go here>
                    }
                 }
              }
           }          


     -

       ::

           name-of-test:
              <other sections>
              pre:
                address 1:
		  balance: 0xba1a9ce000,
		  nonce: 0,
		  code: :raw 0x600160010160005500
		  storage:
		    0x0:  0x012345
		    0x12: 0x121212
                address 2:
                  <account fields go here>



Address Fields
--------------
- **balance**:

  Wei balance at the start of the test

- **nonce**:

  Nonce

- **storage**:

  Values in the storage of the address

  .. list-table::
     :header-rows: 1

     * - JSON

       - YAML

     * -

         ::

            storage: {
		"1": 5, 
		"2": 10
	    }

       -

         ::

            storage:
               1: 5
               2: 10

- **code**:

  The code of the contract. There are several possibilities:

  - If the account is not a contract, this value is **0x**

  - Raw virtual machine code. This is for cases where it is impossible to
    provide source code, or the source code is in a language retesteth
    does not recognize, such as `Vyper <https://vyper.readthedocs.io/en/stable/>`_.

    ::
 
      :raw 0x600160010160005500

  - `Lisp Like Language (lll) <http://blog.syrinx.net/the-resurrection-of-lll-part-1/>`_, 
    for example:
   
    ::

       {
          ; Add 2+2 and store the value in storage location 0
          [[0]] (ADD 2 2)
       }

  - `Solidity, which you can learn here <https://cryptozombies.io/>`_. Solidity
    code can be provided to a test in two ways:
  
    - The solidity code itself

    - You can add a **:solidity** section with the contract definition. In 
      that case, the value is **:solidity <name of contract>**.
