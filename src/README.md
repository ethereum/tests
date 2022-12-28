# List of test vectors ids that can be found in tests
## Withdrawals tests EIP-4895

- ID: **BSHA0001** check that Shanghai block rejected before transition
- ID: **BSHA0002** check that Merge block rejected after transition
- ID: **BSHA0003** check that Block without withdrawals root header field but with withdrawals in the body gets rejected after transition


## EOF1 create
- ID: **EOF1C000** check that legacy create works Merge and >=Shanghai
- ID: **EOF1C001** check that legacy init code can send eof1 code
- ID: **EOF1C002** check that eof1 init code can't send legacy code
- ID: **EOF1C003** check that eof1 init code can send eof1 code >=Shanghai
