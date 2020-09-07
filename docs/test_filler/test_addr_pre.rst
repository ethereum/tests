
.. include:: ../test_filler/test_addr.rst

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
