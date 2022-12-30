#! /usr/bin/node

// Create EOF1 code, with values that are valid and invalid in various fields.
// based on https://github.com/lightclient/go-ethereum/blob/eof/core/vm/eof.go

// To create more examples of valid eof1:
// 1. Copy eof1Good (use cloneEOF1Good to create a deep copy)
// 2. Modify the clone
// 3. Add the clone to eof1GoodList
// 4. Run the script to regenerate EOF1ValidInvalidFiller.yml

// The values for a good eof1 code
const eof1Good = {
  magic: 0xEF00,
  version: 1,
  sections: [
    {    // EIP 4750 section header
       type: 1,  // EIP 4750 metadata
       size: 4   // four bytes (per code section)
    },
    {    // code sections
       type: 2,   // Code sections
       size: 1,   // One code section
       lengths: [3]   // Length of that code section
    },
    {    // data section
       type: 3,   // Data section
       size: 1    // One byte
    }
  ],    // sections
  endOfSections: 0,  // Specified so we can specify a wrong value
  code: [
      {
         code: "305000",
         stackInputs: 0,
         stackOutputs: 0,
         maxStack: 1      // maxStack needs to be accurate, otherwise CREATE[2] fails
      }
  ],
  data: "ff"
}

// Create a one byte value
const byte1 = val => val.toString(16).padStart(2,0).slice(0,2)

// Create a two byte value
const byte2 = val => val.toString(16).padStart(4,0).slice(0,4)


// Convert a specific section into the EOF1 format
const section2eof1 = section => {
  switch (section.type) {
    case 2:   // Code sections, of which there could be many
      return byte1(section.type) + byte2(section.size) +
          section.lengths.map(byte2).reduce((a,b) => a+b)
      // return handles break for us
    default:  // Including invalid values
      return byte1(section.type) + byte2(section.size)

  }
}    // section2eof1



// Create the EIP4750 section
const code2eip4750 = code =>
      byte1(code.stackInputs)+byte1(code.stackOutputs)+byte2(code.maxStack)


// Convert a hash table input EOF1 encoded value.
// No sanity checks, because the whole point is to be able to get invalid ones
const encode = hash => {
  // Start code
  res = byte2(hash.magic) + byte1(hash.version)

  // Section list
  res = res +
      hash.sections.map(section2eof1).reduce((a,b) => a+b) +
      byte1(hash.endOfSections)

  // Type section
  res = res + hash.code.map(code2eip4750).reduce((a,b) => a+b)

  // Finally the code sections and data section
  res = res + hash.code.map(code => code.code).reduce((a,b) => a+b) +
              hash.data

  return res
}  // encode


// Make sure to do a deep copy so we can abuse it
const cloneEof1Good = () => JSON.parse(JSON.stringify(eof1Good))

eof1BadMagic = cloneEof1Good()
eof1BadMagic.magic = 0xEF02

// Other than eof1BadMagic, none of these invalid test cases are actually
// doable as contract. I'm leaving them here because in the future, when
// CREATE works, I'll try to CREATE them to see it fails.
/*
eof1BadVersion0 = cloneEof1Good()
eof1BadVersion0.version = 0


eof1BadVersion2 = cloneEof1Good()
eof1BadVersion2.version = 2


eof1BadSectionOrder = cloneEof1Good()
eof1BadSectionOrder.sections = [
   eof1Good.sections[1],
   eof1Good.sections[2],
   eof1Good.sections[0]
]

eof1NoCodeSection = cloneEof1Good()
eof1NoCodeSection.sections = [
   eof1Good.sections[0],
   eof1Good.sections[2]
]


eof1NoDataSection = cloneEof1Good()
eof1NoDataSection.sections = [
   eof1Good.sections[0],
   eof1Good.sections[1]
]
eof1NoDataSection.data = ""

eof1BadEndOfSections = cloneEof1Good()
eof1BadEndOfSections.endOfSections = 255


eof1InconsistentCodeSec = cloneEof1Good()
eof1InconsistentCodeSec.sections[0].size = 8


eof1ExtraBytes = cloneEof1Good()
eof1ExtraBytes.data = "000bad"

eof1DataTooShort = cloneEof1Good()
eof1DataTooShort.sections[2].size = 6


eof1WierdSectionSize = cloneEof1Good()
eof1WierdSectionSize.sections[0].size = 3
*/

// Good (valid) EOF1's

eof1TwoCode = cloneEof1Good()
eof1TwoCode.sections[0].size = 8
eof1TwoCode.sections[1].size = 2
eof1TwoCode.sections[1].lengths = [3, 5]
eof1TwoCode.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]
eof1TwoCode.code[1].code = "3030505000"
eof1TwoCode.code[1].maxStack = 2


eof1FourCode = cloneEof1Good()
eof1FourCode.sections[0].size = 16
eof1FourCode.sections[1].size = 4
eof1FourCode.sections[1].lengths = [3, 3, 3, 3]
eof1FourCode.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]


// Notes:
//
// Most failures cause geth to panic (that is legitimate here, because IRL those
// invalid EOF1s will fail when created and will never get to the database
//
// 1. Bad version
// 2. Bad section order
// 3. Bad end of sections
// 4. Data too short/long
const eof1BadList = [
	eof1BadMagic,
]  // eof1BadList



const eof1GoodList = [
	eof1Good,
	eof1TwoCode,
	eof1FourCode
]   // eof1GoodList



counter = 0x100

// Go from a code (in hex) to a contract in the test filler format
const code2filler = code => `
    000000000000000000000000000000000000${byte2(counter++)}:
      balance: 0
      code: :raw 0x${code}
      nonce: 1
      storage: {}
`

goodContracts = eof1GoodList.map(encode).map(code2filler).reduce((a,b) => a+b)


txData = ""
for (i=0x100; i<counter; i++)
   txData = txData + `
    - :label good :abi f(uint) 0x${byte2(i)}`


const firstBad=counter

badContracts = eof1BadList.map(encode).map(code2filler).reduce((a,b) => a+b)


for(i=firstBad; i<counter; i++)
   txData = txData + `
    - :label bad  :abi f(uint) 0x${byte2(i)}`



const result = `

EOF1ValidInvalid:

  env:
    currentCoinbase: 2adc25665018aa1fe0e6bc666dac8fc2697ff9ba
    currentDifficulty: '0x20000'
    currentGasLimit: "100000000"
    currentNumber: "1"
    currentTimestamp: "1000"
    previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6

  _info:
    comment: Ori Pomerantz   qbzzt1@gmail.com


  pre:

${goodContracts}

${badContracts}

    # The contract the transaction calls
    cccccccccccccccccccccccccccccccccccccccc:
      balance: 0
      code: |
        :yul {
          let addr := calldataload(0x04)
          let ret := call(gas(), addr, 0, 0, 0, 0, 0)
          sstore(0, ret)
        }
      nonce: 1
      storage: {}

    # User account
    a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
      balance: '0x0ba1a9ce0ba1a9ce'
      code: 0x
      nonce: 1
      storage: {}

  transaction:
    data:
${txData}
    gasLimit:
    - 80000000
    gasPrice: 10
    nonce: 1
    to: cccccccccccccccccccccccccccccccccccccccc
    secretKey: "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"
    value:
    - 0

  expect:

    # Good
    - indexes:
        data:
        - :label good
      network:
        - '>=Shanghai'
      result:
        cccccccccccccccccccccccccccccccccccccccc:
          storage:
             0: 1


    # Bad
    - indexes:
        data:
        - :label bad
      network:
        - '>=Shanghai'
      result:
        cccccccccccccccccccccccccccccccccccccccc:
          storage:
             0: 0


`


console.log(result)


