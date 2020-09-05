Expect
======
This section contains the information we expect to see after the test is 
concluded.


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
                 "expect": [
                   {
                      "network": ["Istanbul", <other forks, see below>],
                      "result": {
                           "address 1": {
                               "balance": 0xba1a9ce000,
                               "nonce": 0,
                               "storage: {
                                   "0x0":  "0x12345",
                                  "0x12": "0x121212"
                               }
                           },
                           "address 2": {
                               <address fields go here>
                           }
                   },
                   { <forks & results> }
                 ]
              }
           }          


     -

       ::

           name-of-test:
              <other sections>
              expect:
              - network:
                - Istanbul
                - <another fork>
                result:
                  address 1:
                    balance: 0xba1a9ce000,
                    nonce: 0,
                    storage:
                      0x0:  0x012345
                      0x12: 0x121212
                  address 2: 
                     <address fields go here>
              - <forks & results>


The Network Specification
-------------------------
The string that identifies a fork (version) within a **network:** 
list is one of three option:

- The specific version: **Istanbul**
- The version or anything later: **>=Frontier**
- Anything up to (but not including) the version **<Constantinople**



Address Fields
--------------
It is not necessary to include all fields for every address. Only include those
fields you wish to test.

- **balance**:

  Wei balance at the end of the test

- **nonce**:

  Nonce

- **storage**:

  Values in the storage for this address. If you specify this field, you have
  to specify **all** the values that the account has in storage.

  .. list-table::
     :header-rows: 1

     * - JSON

       - YAML

     * -

         ::

            storage: {
                "1":  "5", 
                "2": "10"
            }

       -

         ::

            storage:
               1:  5
               2: 10	
