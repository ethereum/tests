#! /usr/bin/bash

# Generate and run random tests until something stops you.
# If the result on geth is different than the result on besu then the final
# hash will be different, the test will fail on besu, and we'll save it as
# /tmp/fail<unique value>Filler.yml
#
#
#
# Besu:
#
# For this test to work, besu needs to be running on an accessible IP address
# and tests/config/besu/config should be the same as the file in this directory,
# except you'll need to change the IP in socketAddress
#
# The command to start besu is:
# docker run -p 8545:8545 -p 13001:30303 \
#    hyperledger/besu:develop retesteth --rpc-http-port 8545 \
#    --host-allowlist '*' # --logging ALL
#
#
# Retesteth (including geth):
#
# Install retesteth on docker, as explained in:
# https://ethereum-tests.readthedocs.io/en/latest/retesteth-tutorial.html#retesteth-in-a-docker-container
# Clone the tests (https://github.com/ethereum/tests) into ~/tests

while true
do
    ./oneTest.sh
done

