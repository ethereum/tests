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

# Actual filling command

%.fill:
	testeth -t $* -- --filltests --verbosity 2
