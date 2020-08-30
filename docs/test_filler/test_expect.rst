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
                      "network": [<forks where this applies>],
                      "result": {
                           "address 1": {
                               <address fields go here>
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
                - <fork>
                - <another fork>
                result:
                  address 1:
                     <address fields go here>
                  address 2: 
                     <address fields go here>
              - <forks & results>

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

            storage: {"1": 5, "2": 10}

       -

         ::

            storage:
               1: 5
               2: 10
