# Prereqs:
 - Have python3 installed
 - Have leveldb installed

# Usage

Clone ethereum tests:
```
git clone https://github.com/ethereum/tests --recursive -b wasm-tests
cd tests/src/GeneralStateTestsFiller/stEWASMTests/utils/
```

Build wabt
```
cd wabt
mkdir build
cd build
cmake -DBUILD_TESTS=OFF ..
make -j4
```

Install wasm-metering
```
cd wasm-metering
npm install
```

Setup tests script:
```
cd ../..
pipenv shell --python $(which python3)
```

Install python deps and convert tests
```
pip install pyyaml
./run.sh
```

Setup CPPEthereum:
```
git clone --recursive https://github.com/jwasinger/cpp-ethereum -b ewasm-tests
cd cpp-ethereum
mkdir build
cd build
cmake -DHERA=ON ..
make -j4
```

Fill tests:
```
cd path/to/cpp-ethereum/build
ETHEREUM_TEST_PATH='path/to/tests/repo' test/testeth -t GeneralStateTests/stEWASMTests -- --filltests --vm hera --singlenet "Byzantium"
```
