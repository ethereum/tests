Expect
======
This section contains the information we expect to see after the test is 
concluded. Virtual machine tests use a simplified version, which 
includes only one address and for that address only the storage.


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
                 "expect": {
                    "address in exec section": {
                       "storage": {
                         "<address in storage>": "<value>"
                       }
                    }
                 }
              }
           }          


     -

       ::

           name-of-test:
              <other sections>
              expect:
                <address in exec>:
                  storage:
                     <address in storage>: <value>
