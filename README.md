tests   [![Build Status](https://travis-ci.org/ethereum/tests.svg?branch=develop)](https://travis-ci.org/ethereum/tests)
=====

[![Join the chat at https://gitter.im/ethereum/tests](https://badges.gitter.im/ethereum/tests.svg)](https://gitter.im/ethereum/tests?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Common tests for all clients to test against.

All files should be of the form:

```
{
	"test1name":
	{
		"test1property1": ...,
		"test1property2": ...,
		...
	},
	"test2name":
	{
		"test2property1": ...,
		"test2property2": ...,
		...
	}
}
```

Arrays are allowed, but don't use them for sets of properties - only use them for data that is clearly a continuous contiguous sequence of values.

