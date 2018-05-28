#!/usr/bin/env python3

# Eventual goals:
#
# - Check validity of tests fillers.
# - Filter test fillers based on properties.
# - Convert between various test filler formats.

# Non-goals:
#
# - Test filling.
# - Test post-state checking.

# Current goals:
#
# - Generate GeneralStateTests from VMTests.

# Input:
#
# - VMTest filler directory/name, without suffix Filler.json
#   eg. vmArithmeticTest/add0

# Output:
#
# - GeneralStateTest filler
#   eg. stVMTests/vmArithmeticTest/add0Filler.json

