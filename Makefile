ETHEREUM_TEST_PATH=$(CURDIR)
export ETHEREUM_TEST_PATH

tx_tests:=$(wildcard TransactionTests/*)
gs_tests:=$(wildcard GeneralStateTests/*)
bc_tests:=$(wildcard BlockchainTests/*)
vm_tests:=$(wildcard VMTests/*)
all_tests:=$(tx_tests) $(gs_tests) $(bc_tests) $(vm_tests)

fill-tx: $(tx_tests:=.fill)
fill-gs: $(gs_tests:=.fill)
fill-bc: $(bc_tests:=.fill)
fill-vm: $(vm_tests:=.fill)
fill-all: fill-tx fill-gs fill-bc fill-vm

test-tx: $(tx_tests:=.test)
test-gs: $(gs_tests:=.test)
test-bc: $(bc_tests:=.test)
test-vm: $(vm_tests:=.test)
test-all: test-tx test-gs test-bc test-vm

# Testing command

%.test:
	testeth -t $* -- --verbosity 2

# Actual filling command

%.fill:
	testeth -t $* -- --filltests --verbosity 2
