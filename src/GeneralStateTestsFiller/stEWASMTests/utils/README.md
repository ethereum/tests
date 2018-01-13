# USAGE
Setup CPPEthereum:
```
git clone --recursive https://github.com/jwasinger/cpp-ethereum -b ewasm-tests
cd cpp-ethereum
mkdir build
cd build
cmake -DHERA=ON ..
make -j4
```

Build wabt
```
git submodule update --init --recursive
cd wabt
mkdir build
cd build
cmake -DBUILD_TESTS=OFF ..
make -j4
mv wat2wasm ../..
```

Setup tests script:
```
pipenv shell --python $(which python3)
```

Install python deps and convert tests
```
pip install pyyaml
./run.sh
```

Fill tests:
```
cd path/to/cpp-ethereum/build
ETHEREUM_TEST_PATH='path/to/tests/repo' test/testeth -t GeneralStateTests/stEWASMTests -- --filltests --vm hera --singlenet "Byzantium"
```
