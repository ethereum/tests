#! /usr/bin/node

// Take Yul as input, turn it into a filler.
// This code needs to:
// 1. Overwrite storage cell 0 with zero
// 2. Not write anywhere else in storage

let fs = require('fs')


const yul = fs.readFileSync(process.argv[2]).toString()
const yulIndent = yul.replace(/^/gm, "          ")

const tests = yul.match(/Implements:.*/gm)
const testsIndent = tests.map(line => line.replace(/^/gm, "       ")).
                       reduce((a,b) => a+'\n'+b)



console.log(
`
${process.argv[3]}:

  env:
    currentCoinbase: 2adc25665018aa1fe0e6bc666dac8fc2697ff9ba
    currentDifficulty: '0x20000'
    currentGasLimit: "100000000"
    currentNumber: "1"
    currentTimestamp: "1000"
    previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6

  _info:
    comment: |
       Ori Pomerantz qbzzt1@gmail.com
       Created by src/Templates/EachOpcode/Yul2Filler.js
${testsIndent}

  pre:

    # The Yul code
    CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC:
      balance: 0
      code: |
        :yul {
${yulIndent}
        }
      nonce: 1
      storage:
        0: 0x60A7


    # User account
    a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
      balance: '0x0ba1a9ce0ba1a9ce'
      code: 0x
      nonce: 1
      storage: {}


  transaction:
    data:
    - 0x
    gasLimit:
    - 80000000
    gasPrice: 10
    nonce: 1
    to: cccccccccccccccccccccccccccccccccccccccc
    secretKey: "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"
    value:
    - 0

  expect:

    - indexes:
        data: !!int -1
        gas:  !!int -1
        value: !!int -1
      network:
        - '>=Shanghai'
      result:
        cccccccccccccccccccccccccccccccccccccccc:
          storage:
            0: 0 # which means it was overwritten
`)


