#! /usr/bin/node

// Create EOF1 code, with values that are valid and invalid in various fields.
// based on https://github.com/lightclient/go-ethereum/blob/eof/core/vm/eof.go
// Then create a test with deploy transactions for all of them, and see that
// only the valid ones result in contracts

// The values for good eof1 code
// This is the prototype that other examples, valid and invalid, build on
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


// Convert code into a (legacy) init code that deploys it
// 0x00 CODESIZE 0x38
// 0x01 PUSH1 0  0x6000
// 0x03 PUSH1 0  0x6000
// 0x05 CODECOPY 0x39     codecopy(0,0,codesize())
// 0x06 PUSH1    0x600D
// 0x08 CODESIZE 0x38
// 0x09 SUB      0x03
// 0x0A PUSH1    0x600D
// 0x0C RETURN   0xF3     return(0x0D, sub(codesize(), 0x0D))
const code2init = code => `386000600039600D3803600DF3${code}`




// Make sure to do a deep copy so we can abuse it
const cloneEof1Good = () => JSON.parse(JSON.stringify(eof1Good))

eof1BadMagic = cloneEof1Good()
eof1BadMagic.magic = 0xEF02

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

eof1StackHeightTooHigh = cloneEof1Good()
eof1StackHeightTooHigh.code[0].maxStack = 2

eof1StackHeightTooLow = cloneEof1Good()
eof1StackHeightTooLow.code[0].code = '3030505000'
eof1StackHeightTooLow.sections[1].lengths = [5]

eof1StackUnderflow = cloneEof1Good()
eof1StackUnderflow.code[0].code = '3050505000'
eof1StackUnderflow.sections[1].lengths = [5]

// The first code section can't have parameters, because it is called directly
eof1StackParamSec0 = cloneEof1Good()
eof1StackParamSec0.sections[0].size = 8
eof1StackParamSec0.sections[1].size = 2
eof1StackParamSec0.sections[1].lengths = [3, 3]
eof1StackParamSec0.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]
eof1StackParamSec0.code[0].code = "300100"
eof1StackParamSec0.code[0].maxStack = 2
eof1StackParamSec0.code[0].stackInputs = 1



// The first code section can't have return values, because it is called directly
eof1StackRetvalSec0 = cloneEof1Good()
eof1StackRetvalSec0.sections[0].size = 8
eof1StackRetvalSec0.sections[1].size = 2
eof1StackRetvalSec0.sections[1].lengths = [1, 3]
eof1StackRetvalSec0.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]
eof1StackRetvalSec0.code[0].code = "30"
eof1StackRetvalSec0.code[0].maxStack = 1
eof1StackRetvalSec0.code[0].stackOutputs = 1


const eof1BadList = [
	eof1BadMagic,
        eof1BadVersion0,
        eof1BadVersion2,
        eof1BadSectionOrder,
        eof1NoCodeSection,
        eof1NoDataSection,
        eof1BadEndOfSections,
        eof1InconsistentCodeSec,
        eof1ExtraBytes,
        eof1DataTooShort,
        eof1WierdSectionSize,
        eof1StackHeightTooHigh,
        eof1StackHeightTooLow,
        eof1StackParamSec0
]  // eof1BadList




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


eof1StackParam = cloneEof1Good()
eof1StackParam.sections[0].size = 8
eof1StackParam.sections[1].size = 2
eof1StackParam.sections[1].lengths = [3, 3]
eof1StackParam.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]
eof1StackParam.code[1].code = "300100"
eof1StackParam.code[1].maxStack = 2
eof1StackParam.code[1].stackInputs = 1

eof1StackRetval = cloneEof1Good()
eof1StackRetval.sections[0].size = 8
eof1StackRetval.sections[1].size = 2
eof1StackRetval.sections[1].lengths = [3, 1]
eof1StackRetval.code = [
   JSON.parse(JSON.stringify(eof1Good.code[0])),
   JSON.parse(JSON.stringify(eof1Good.code[0]))
]
eof1StackRetval.code[1].code = "30"
eof1StackRetval.code[1].maxStack = 1
eof1StackRetval.code[1].stackOutputs = 1



const eof1GoodList = [
	eof1Good,
	eof1TwoCode,
	eof1FourCode,
	eof1StackParam,
	eof1StackRetval
]   // eof1GoodList

badContracts = eof1BadList.map(encode).map(code2init)
goodContracts = eof1GoodList.map(encode).map(code2init)



const result = `

EOF1ValidInvalid:

# Try to create valid and invalid EOF1 encoded contracts
# See that only the valid ones turn into contracts
#
# Generated by src/Templates/EOF1/EOF1-generator.js

  env:
    currentCoinbase: 2adc25665018aa1fe0e6bc666dac8fc2697ff9ba
    currentDifficulty: '0x20000'
    currentGasLimit: "100000000"
    currentNumber: "1"
    currentTimestamp: "1000"
    previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6

  _info:
    comment: Ori Pomerantz  qbzzt1@gmail.com

  pre:


    # User account
    a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
      balance: 0x100000000000000000
      code: 0x
      nonce: 1
      storage: {}

  transaction:
    data:
${badContracts.map(code => `
      - :label bad  :raw 0x${code}
`).reduce((a,b) => a+b)}

${goodContracts.map(code => `
      - :label good :raw 0x${code}
`).reduce((a,b) => a+b)}

    gasLimit:
    - 80000000
    gasPrice: 10
    nonce: 1
    to: ''
    secretKey: "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"
    value:
    - 0

  expect:

    # Good, a contract got created
    - indexes:
        data:
        - :label good
      network:
        - '>=Shanghai'
      result:
        ec0e71ad0a90ffe1909d27dac207f7680abba42d:
          nonce: 1

    # Bad, no contract
    - indexes:
        data:
        - :label bad
      network:
        - '>=Shanghai'
      result:
        ec0e71ad0a90ffe1909d27dac207f7680abba42d:
          shouldnotexist: 1


`


console.log(result)


