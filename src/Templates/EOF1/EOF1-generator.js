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


// Create a valid code section in an EOF1 structure
const createEOF1Code = (codeList, maxStacks) => {
    // Start from a valid copy
    eof1 = cloneEof1Good()

    // Size of sections
    eof1.sections[0].size = codeList.length*4
    eof1.sections[1].size = codeList.length

    // The values for each entry
    eof1.sections[1].lengths = codeList.map(code => code.length/2)

    // Assume stackInputs, stackOutputs, and maxStack are zero.
    // let it be fixed
    eof1.code = codeList.map((code, i) => { return {
	code: code,
	stackInputs: 0,
	stackOutputs: 0,
	maxStack: maxStacks[i]
    }})

    return eof1
}  // createEOF1Code



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
]  // eof1BadList


eof1GoodList = [eof1Good]

// Multiple code segments are fine
eof1GoodList.push(createEOF1Code(["305000", "3030505000"], [1, 2]))
eof1GoodList.push(createEOF1Code(["305000", "305000", "305000", "305000"],
                              [1,1,1,1]))

// Create tests in groups. A good example, and bad examples that are related
// so we know they fail for the right reason.

// FE, the designated invalid opcode, is valid in a code segment.
// Other opcode values, however, are invalid
eof1GoodList.push(createEOF1Code(["FE00"], [0]))
 eof1BadList.push(createEOF1Code(["EF00"], [0]))


// maxStack needs to be the correct value,
eof1GoodList.push(createEOF1Code(["3030505000"], [2]))
 eof1BadList.push(createEOF1Code(["3030505000"], [1]))
 eof1BadList.push(createEOF1Code(["3030505000"], [3]))

// stack underflow
 eof1BadList.push(createEOF1Code(["30505000"], [1]))


// parameters are allowed except on section 0
temp = createEOF1Code(["305000", "300150"], [1, 2])
temp.code[1].stackInputs = 1
eof1GoodList.push(temp)

temp = createEOF1Code(["300150", "305000"], [2, 1])
temp.code[0].stackInputs = 1
 eof1BadList.push(temp)


// Return values are allowed, except on section 0
temp = createEOF1Code(["305000", "303001"], [1, 2])
temp.code[1].stackOutputs = 1
eof1GoodList.push(temp)

temp = createEOF1Code(["303001", "305000"], [2, 1])
temp.code[0].stackOutputs = 1
 eof1BadList.push(temp)


// Function calls are allowed, as long as the function exists
eof1GoodList.push(createEOF1Code(["B0000100", "00"], [0, 0]))
 eof1BadList.push(createEOF1Code(["B0000200", "00"], [0, 0]))


// Stack underflow is bad
eof1GoodList.push(createEOF1Code(["3030015000"], [2]))
 eof1BadList.push(createEOF1Code(["30015000"], [1]))


// Endless loops are OK, but stack overflow isn't
eof1GoodList.push(createEOF1Code(["3050B0000000"], [1]))
 eof1BadList.push(createEOF1Code(["30B0000000"], [1]))


// The parameters aren't part of maxStackHeight
temp = createEOF1Code(["60FF" + "B00001" + "00", "50" + "B1"], [1, 0])
temp.code[1].stackInputs = 1
temp.code[1].stackOutputs = 0
 eof1GoodList.push(temp)

temp = createEOF1Code(["60FF" + "B00001" + "00", "50" + "B1"], [1, 1])
temp.code[1].stackInputs = 1
temp.code[1].stackOutputs = 0
 eof1BadList.push(temp)

// We can't dig below our parameters
// with POP
temp = createEOF1Code(["00", "505050" + "B1"], [0, 0])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push(temp)

// DUP
temp = createEOF1Code(["00", "81" + "B1"], [0, 3])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push(temp)

temp = createEOF1Code(["00", "82" + "B1"], [0, 3])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push(temp)


// SWAP
temp = createEOF1Code(["00", "90" + "B1"], [0, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push(temp)

temp = createEOF1Code(["00", "91" + "B1"], [0, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push(temp)



// Jumps

// Try an old style jump, see it fails
 eof1BadList.push(createEOF1Code(["00", "5B600056"], [0, 1]))

// Old style conditional jump
 eof1BadList.push(createEOF1Code(["00", "5B6001600057"], [0, 1]))

// New style jump
eof1GoodList.push(createEOF1Code(["00", "5C0000"], [0, 0]))

// New style jump that actually does something
eof1GoodList.push(createEOF1Code(["00", "5C000260FF60FFB1"], [0, 1]))
eof1GoodList.push(createEOF1Code(["00", "60FF5C0002600150", "00"], [0, 1, 0]))

// New style jump to hyperspace
 eof1BadList.push(createEOF1Code(["00", "5C0010"], [0, 0]))
 eof1BadList.push(createEOF1Code(["00", "5CFF00"], [0, 0]))




// GOON: Things that shouldn't work but do for some reason

/*

// Function with output only, the output doesn't contribute to maxStackHeight
temp = createEOF1Code(["B00001" + "50" + "00", "60FF" + "B1"], [0, 1])
temp.code[1].stackInputs = 0
temp.code[1].stackOutputs = 1
eof1GoodList.push(temp)


// But why do we get here a maxStackHeight of one,
// not zero (without the inputs) or two (with them)?
temp = createEOF1Code(["00", "5050" + "B1"], [0, 1])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push(temp)

// Why are we allowed to push values that aren't stack outputs?
eof1GoodList.push(createEOF1Code(["00", "600160026003B1"], [0, 3]))

// New style jump into the middle of an instruction
eof1GoodList.push(createEOF1Code(["00", "5C000160FF60FFB1"], [0, 1]))


// Jump slightly beyond the segment
eof1GoodList.push(createEOF1Code(["00", "5C0001", "00"], [0, 0, 0]))
eof1GoodList.push(createEOF1Code(["00", "5C0001"], [0, 0]))


// New style conditional jump
// Why is maxStackHeight 2? we push a value, pop it, and push a different value
eof1GoodList.push(createEOF1Code(["00", "6000" + "5D0000" + "30"], [0, 2]))



// These should be good, but instead they fail
eof1GoodList.push(createEOF1Code(["00", "5C00005C0000"], [0, 0]))

// Error: DebugVMTrace parse error: Error in DataObject:
// key: '' type: 'object'
// assert: count(_key) _key=time (DataObject::atKey)
// {
//     "output" : "ef000101000802000200010006030001000000000000000000005c00005c0000ff",
//     "gasUsed" : "0x4c3e320",
//     "error" : "relative offset out-of-bounds: 3"
// }

eof1GoodList.push(createEOF1Code(["00", "6000" + "5D0000"], [0, 1]))

// Error: ERROR OCCURED FILLING TESTS: DebugVMTrace parse error: Error in DataObject:
// key: '' type: 'object'
// assert: count(_key) _key=time (DataObject::atKey)
// {
//     "output" : "ef0001010008020002000100050300010000000000000000020060005d0000ff",
//     "gasUsed" : "0x4c3e318",
//     "error" : "relative offset out-of-bounds: 2"
// }

eof1GoodList.push(createEOF1Code(["00", "6000" + "5D0002" + "5B5B5B5B5B"], [0, 1]))

// Error: ERROR OCCURED FILLING TESTS: DebugVMTrace parse error: Error in DataObject:
// key: '' type: 'object'
// assert: count(_key) _key=time (DataObject::atKey)
// {
//     "output" : "ef00010100080200020001000a0300010000000000000000010060005d00025b5b5b5b5bff",
//     "gasUsed" : "0x4c3e2bc",
//     "error" : "stack underflow"
// }


*/


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
${badContracts.map((code, i) => `
      # Data ${i}
      - :label bad  :raw 0x${code}
`).reduce((a,b) => a+b)}

${goodContracts.map((code, i) => `
      # Data ${i+badContracts.length}
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


