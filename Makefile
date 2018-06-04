ETHEREUM_TEST_PATH=$(CURDIR)
export ETHEREUM_TEST_PATH

tx_tests:=$(wildcard TransactionTests/*)
gs_tests:=$(wildcard GeneralStateTests/*)
bc_tests:=$(wildcard BlockchainTests/*)
vm_tests:=$(wildcard VMTests/*)
all_tests:=$(gs_tests) $(bc_tests) $(vm_tests)

tx_fillers:=$(wildcard src/TransactionTestsFiller/*)
gs_fillers:=$(wildcard src/GeneralStateTestsFiller/*)
bc_fillers:=$(wildcard src/BlockchainTestsFiller/*)
vm_fillers:=$(filter-out %.sol %.md, $(wildcard src/VMTestsFiller/*))
all_fillers:=$(gs_fillers) $(bc_fillers) $(vm_fillers)

all_schemas:=$(wildcard JSONSchema/*.json)

# Testset sanitation

sani: $(all_schemas:=.format) $(vm_fillers:=.format) $(vm_tests:=.format)

%.format:
	python3 test.py format ./$*
	git diff --quiet --exit-code &>/dev/null

%.sani:
	python3 test.py validate    ./$*
	python3 test.py checkFilled ./$*

# Test running command

run-tests:=$(all-tests:=.test)
run: $(run-tests)

%.run:
	testeth -t $* -- --verbosity 2

# Test filling command

fill-tests:=$(all-tests:=.fill)
fill: $(fill-tests)

%.fill:
	testeth -t $* -- --filltests --verbosity 2
	python3 test.py format ./$*
