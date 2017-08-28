.. _state_tests:

################################################################################
State Tests
################################################################################

Found in ``/StateTest``, the state tests aim is to test the basic workings of the state in isolation.

It is based around the notion of executing a single transaction, described by the ``transaction`` portion of the test. The overarching environment in which it is executed is described by the ``env`` portion of the test and includes attributes of the current and previous blocks. A set of pre-existing accounts are detailed in the ``pre`` portion and form the world state prior to execution. Similarly, a set of accounts are detailed in the ``post`` portion to specify the end world state. Since the data of the blockchain is not given, the opcode ``BLOCKHASH`` could not return the hashes of the corresponding blocks. Therefore we define the hash of block number ``n`` to be  ``SHA256("n")``.

The log entries (``logs``) as well as any output returned from the code (``output``) is also detailed.

It is generally expected that the test implementer will read ``env``, ``transaction`` and ``pre`` then check their results against ``logs``, ``out``, and ``post``.

Basic structure
--------------------------------------------------------------------------------

::

	{
	   "test name 1": {
		   "env": { ... },
		   "logs": { ... },
		   "out": { ... },
		   "post": { ... },
		   "pre": { ... },
		   "transaction": { ... },
	   },
	   "test name 2": {
		   "env": { ... },
		   "logs": { ... },
		   "out": { ... },
		   "post": { ... },
		   "pre": { ... },
		   "transaction": { ... },
	   },
	   ...
	}


Sections
--------------------------------------------------------------------------------

* **The** ``env`` **section:**

| ``currentCoinbase``	
|	The current block's coinbase address, to be returned by the `COINBASE` instruction.
| ``currentDifficulty``
|	The current block's difficulty, to be returned by the `DIFFICULTY` instruction.
| ``currentGasLimit``	
|	The current block's gas limit.
| ``currentNumber``
|	The current block's number. Also indicates network rules for the transaction. Since blocknumber = **1000000** Homestead rules are applied to transaction. (see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.mediawiki)
| ``currentTimestamp``
|	The current block's timestamp.
| ``previousHash``
|	The previous block's hash.
|

* **The** ``transaction`` **section:**

| ``data`` 
|	The input data passed to the execution, as used by the `CALLDATA`... instructions. Given as an array of byte values. See $DATA_ARRAY.
| ``gasLimit`` 
|	The total amount of gas available for the execution, as would be returned by the `GAS` instruction were it be executed first.
| ``gasPrice`` 
|	The price of gas for the transaction, as used by the `GASPRICE` instruction.
| ``nonce``
|	Scalar value equal to the number of transactions sent by the sender.
| ``address``
|	The address of the account under which the code is executing, to be returned by the `ADDRESS` instruction.
| ``secretKey``
|	The secret key as can be derived by the v,r,s values if the transaction.
| ``to``
|	The address of the transaction's recipient, to be returned by the `ORIGIN` instruction.
| ``value`` 
|	The value of the transaction (or the endowment of the create), to be returned by the `CALLVALUE`` instruction (if executed first, before any `CALL`).
| 

* **The** ``pre`` **and** ``post`` **sections each have the same format of a mapping between addresses and accounts. Each account has the format:**

| ``balance``
|	The balance of the account.
| ``nonce``
|	The nonce of the account.
| ``code``
|	The body code of the account, given as an array of byte values. See $DATA_ARRAY.
| ``storage``
|	The account's storage, given as a mapping of keys to values. For key used notion of string as digital or hex number e.g: ``"1200"`` or ``"0x04B0"`` For values used $DATA_ARRAY.
|

| The ``logs`` sections is a mapping between the blooms and their corresponding logentries.
| Each logentry has the format:
| ``address`` The address of the logentry.
| ``data``	The data of the logentry.
| ``topics`` The topics of the logentry, given as an array of values.  
|

Finally, there is one simple key ``output``

| ``output``
| The data, given as an array of bytes, returned from the execution (using the ``RETURN`` instruction). See $DATA_ARRAY. In order to avoid big data files, there is one exception. If the output data is prefixed with ``#``, the following number represents the size of the output, and not the output directly.
|

 **$DATA_ARRAY** - type that intended to contain raw byte data   
  and for convenient of the users is populated with three   
  types of numbers, all of them should be converted and   
  concatenated to a byte array for VM execution.   
  
  The types are: 
 
  1. number - (unsigned 64bit)
  2. "longnumber" - (any long number)
  3. "0xhex_num"  - (hex format number)


   e.g: ``````[1, 2, 10000, "0xabc345dFF", "199999999999999999999999999999999999999"]``````			 