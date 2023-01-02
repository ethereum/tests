# List of test vectors ids that can be found in tests
## Withdrawals tests EIP-4895

- ID: **BSHA0001** check that Shanghai block rejected before transition
- ID: **BSHA0002** check that Merge block rejected after transition
- ID: **BSHA0003** check that Block without withdrawals root header field but with withdrawals in the body gets rejected after transition
- ID: **BSHA0004** check that if withdrawals root does not match the withdrawals body block rejected
- ID: **BSHA0005** check that Shanghai block without withdrawals rlp body is rejected as incomplete
- ID: **BSHA0006** check if withdrawals rlp body is not presented as List

### Withdrawals index bounds
- ID: **BSHB0001** withdrawals index is 2^64-1
- ID: **BSHB0002** withdrawals index is 2^64
- ID: **BSHB0003** withdrawals index is bigint
- ID: **BSHB0004** withdrawals validatorIndex 2^64-1
- ID: **BSHB0005** withdrawals validatorIndex 2^64
- ID: **BSHB0006** withdrawals validatorIndex bigint
- ID: **BSHB0007** withdrawals address is 0x0000..00
- ID: **BSHB0008** withdrawals address is less than 20 bytes
- ID: **BSHB0009** withdrawals address is more than 20 bytes
- ID: **BSHB0010** withdrawals amount 0 is fine
- ID: **BSHB0011** withdrawals amount more 2^256 is bad
- ID: **BSHB0012** withdrawals amount more 2^64 is ok
