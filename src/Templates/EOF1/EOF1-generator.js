#! /usr/bin/node

// Create EOF1 code, with values that are valid and invalid in various fields.
// based on https://github.com/lightclient/go-ethereum/blob/eof/core/vm/eof.go
// Then create a test with deploy transactions for all of them, and see that
// only the valid ones result in contracts

// Values for good eof1 code
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
  data: "ef"
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

    // Assume stackInputs and stackOutputs are zero
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

eof1BadList = [
	[eof1BadMagic, "EOF1I0001"],
        [eof1BadVersion0, "EOF1I0002"],
        [eof1BadVersion2, "EOF1I0002"],
        [eof1BadSectionOrder, "EOF1I0003"],
        [eof1NoCodeSection, "EOF1I0004"],
        [eof1NoDataSection, "EOF1I0004"],
        [eof1BadEndOfSections, "EOF1I0005"],
        [eof1InconsistentCodeSec, "EOF1I0018"],
        [eof1ExtraBytes, "EOF1I0006"],
        [eof1DataTooShort, "EOF1I0006"],
        [eof1WierdSectionSize, ""]
]  // eof1BadList


eof1GoodList = [[eof1Good, "EOF1V0001"]]

// Multiple code segments are fine
eof1GoodList.push([createEOF1Code(["305000", "3030505000"], [1, 2]), "EOF1V0002"])
eof1GoodList.push([createEOF1Code(["305000", "305000", "305000", "305000"],
                              [1,1,1,1]), "EOF1V0003"])

// Create tests in groups. A good example, and bad examples that are related
// so we know they fail for the right reason.

// FE, the designated invalid opcode, is valid in a code segment.
// Other opcode values, however, are invalid
eof1GoodList.push([createEOF1Code(["FE"], [0]), "EOF1V0004"])
 eof1BadList.push([createEOF1Code(["EF"], [0]), "EOF1I0008"])


// maxStack needs to be the correct value,
eof1GoodList.push([createEOF1Code(["3030505000"], [2]), "EOF1V0001"])
 eof1BadList.push([createEOF1Code(["3030505000"], [1]), "EOF1I0009"])
 eof1BadList.push([createEOF1Code(["3030505000"], [3]), "EOF1I0009"])

// stack underflow
 eof1BadList.push([createEOF1Code(["30505000"], [1]), "EOF1I0012"])

// stack overflow
push10 = ""  // Push ten values into the stack
for (i=0; i<10; i++) push10 += "30"

push100 = "" // Push a hundred values into the stack
             // assume push10 is code segment 1
for(var i=0; i<10; i++) push100 += "B00001"

push1000 = "" // Push a thousand values into the stack
              // assume push100 is code segment 2
for(var i=0; i<10; i++) push1000 += "B00002"

// 1023 values into the stack
temp = createEOF1Code([push1000 + push10 + push10 + "303030" + "00",   // Segment 0
			push10+"B1",                        // Segment 1
                        push100+"B1"],                      // Segment 2
                        [1023, 10, 100])   // maxStackHeight
// Specify how many outputs segments have
temp.code[1].stackOutputs = 10
temp.code[2].stackOutputs = 100
eof1GoodList.push([temp, "EOF1V0015"])


// 1024 values into the stack
temp = createEOF1Code([push1000 + push10 + push10 + "30303030" + "00",   // Segment 0
			push10+"B1",                        // Segment 1
                        push100+"B1"],                      // Segment 2
                        [1024, 10, 100])   // maxStackHeight
// Specify how many outputs segments have
temp.code[1].stackOutputs = 10
temp.code[2].stackOutputs = 100
 eof1BadList.push([temp, "EOF1I0025"])



// parameters are allowed except on section 0
temp = createEOF1Code(["305000", "300150B1"], [1, 2])
temp.code[1].stackInputs = 1
eof1GoodList.push([temp, "EOF1V0009"])

temp = createEOF1Code(["30015000", "305000B1"], [2, 1])
temp.code[0].stackInputs = 1
 eof1BadList.push([temp, "EOF1I0017"])


// Return values are allowed, except on section 0
temp = createEOF1Code(["305000", "303001B1"], [1, 2])
temp.code[1].stackOutputs = 1
eof1GoodList.push([temp, "EOF1V0006"])

temp = createEOF1Code(["30300100", "305000"], [2, 1])
temp.code[0].stackOutputs = 1
 eof1BadList.push([temp, "EOF1I0010"])


// Function calls are allowed, as long as the function exists
//
 eof1BadList.push([createEOF1Code(["B0000200", "00"], [0, 0]), "EOF1I0011"])


// Stack underflow is bad
eof1GoodList.push([createEOF1Code(["3030015000"], [2]), ""])
 eof1BadList.push([createEOF1Code(["30015000"], [1]), "EOF1I0012"])


// Endless loops are OK
eof1GoodList.push([createEOF1Code(["3050B0000000"], [1]), "EOF1V0007"])

// The parameters are part of maxStackHeight
temp = createEOF1Code(["60FF" + "B00001" + "00", "50" + "B1"], [1, 1])
temp.code[1].stackInputs = 1
temp.code[1].stackOutputs = 0
eof1GoodList.push([temp, "EOFV0010"])

// We can't dig below our parameters
// with POP
temp = createEOF1Code(["00", "505050" + "B1"], [0, 0])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push([temp, "EOF1I0014"])

// DUP
temp = createEOF1Code(["00", "81505050" + "B1"], [0, 3])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push([temp, "EOF1I0014"])

temp = createEOF1Code(["00", "82505050" + "B1"], [0, 3])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push([temp, "EOF1I0014"])


// SWAP
temp = createEOF1Code(["00", "905050" + "B1"], [0, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push([temp, ""])

temp = createEOF1Code(["00", "915050" + "B1"], [0, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push([temp, "EOF1I0014"])



// Removed opcodes
// Try an old style jump, see it fails
 eof1BadList.push([createEOF1Code(["00", "5B600056"], [0, 1]), "EOF1I0015"])

// Old style conditional jump
 eof1BadList.push([createEOF1Code(["00", "5B6001600057"], [0, 1]), "EOF1I0015"])


// Suicidal code
 eof1BadList.push([createEOF1Code(["60016002FF00"], [2, 0]), "EOF1I0015"])


// CALLCODE
 eof1BadList.push([createEOF1Code(["6001600260036004600560066007F200"], [7, 0]), "EOF1I0015"])



// Jumps
// New style jump
eof1GoodList.push([createEOF1Code(["00", "5C000000"], [0, 0]), "EOF1V0008"])

// New style jump that actually does something
eof1GoodList.push([createEOF1Code(["00", "5C0001B15CFFFC"], [0, 0]), "EOF1V0008"])

eof1GoodList.push([createEOF1Code(["00", "5C00005C0000B1"], [0, 0]), "EOF1V0008"])


// New style jump to hyperspace
 eof1BadList.push([createEOF1Code(["00", "5C0010"], [0, 0]), "EOF1I0016"])
 eof1BadList.push([createEOF1Code(["00", "5CFF00"], [0, 0]), "EOF1I0016"])

// Jump to just before or after the code (bug that got solved)
 eof1BadList.push([createEOF1Code(["00", "5C0001", "00"], [0, 0, 0]), "EOF1I0016"])
 eof1BadList.push([createEOF1Code(["00", "5CFFFC", "00"], [0, 0, 0]), "EOF1I0016"])


temp = createEOF1Code(["00", "600160026003B1"], [0, 3])
temp.code[1].stackInputs = 0
temp.code[1].stackOutputs = 2
 eof1BadList.push([temp, "EOF1I0013"])

// New style jump into the middle of an instruction
 eof1BadList.push([createEOF1Code(["00", "5C000160FF60FFB1"], [0, 1]), "EOF1I0019"])


// New style conditional jump
eof1GoodList.push([createEOF1Code(["00", "6000" + "5D0000" + "30" + "00"], [0, 1]),
		"EOF1V0011"])

// New style conditional jump that actually does something
eof1GoodList.push([createEOF1Code(["00", "6000" + "5D0002" + "3050" + "3000"], [0, 1]),
		"EOF1V0011"])

// New style conditional jump into the middle of an instruction
 eof1BadList.push([createEOF1Code(["00", "60015D000160FF50B1"], [0, 1]), "EOF1I0019"])

// Two different pathes to the same opcode, with the same stack height
eof1GoodList.push([createEOF1Code(["00", "6000" + "5D0002" + "3050" + "3000"], [0, 1]),
		"EOF1V0011"])


// Two different pathes to the same opcode, with different stack heights
 eof1BadList.push([createEOF1Code(["00", "6000" + "5D0001" + "30" + "3000"], [0, 2]),
		"EOF1I0020"])


// section output affects maxStackHeight on the caller
temp = createEOF1Code(["B00001" + "50" + "00", "60FF" + "B1"], [1, 1])
temp.code[1].stackInputs = 0
temp.code[1].stackOutputs = 1
eof1GoodList.push([temp, "EOFV0012"])


// RJUMPV, use jump table
eof1GoodList.push(
  [
    createEOF1Code
      ([
	"6001" +   // PUSH1 1
        "5E"   +   // RJUMPV, use jump table
        "05"   +   // Number of entries in jump table
        "0000" +   // Relative address, case 0
        "0000" +   // Relative address, case 1
        "0000" +   // Relative address, case 2
        "0000" +   // Relative address, case 3
        "0000" +   // Relative address, case 4
        "00"       // STOP
       ], [1]
      ), "EOF1V0013"])


// RJUMPV that actually does something
eof1GoodList.push(
  [
    createEOF1Code
      ([
	"6001" +   // PUSH1 1
        "5E"   +   // RJUMPV, use jump table
        "05"   +   // Number of entries in jump table
        "0000" +   // Relative address, case 0
        "0001" +   // Relative address, case 1
        "0001" +   // Relative address, case 2
        "0000" +   // Relative address, case 3
        "0001" +   // Relative address, case 4
        "00" +     // STOP
        "305000"   // ADDRESS, POP, STOP
       ], [1]
      ), "EOF1V0013"])



// RJUMPV into the middle of an opcode
 eof1BadList.push(
  [
    createEOF1Code
      ([
	"6001" +   // PUSH1 1
        "5E"   +   // RJUMPV, use jump table
        "05"   +   // Number of entries in jump table
        "0000" +   // Relative address, case 0
        "0001" +   // Relative address, case 1
        "0001" +   // Relative address, case 2
        "0002" +   // Relative address, case 3
        "0001" +   // Relative address, case 4
        "00" +     // STOP
        "60FF5000" // PUSH1, POP, STOP
       ], [1]
      ), "EOF1I0019"])


// RJUMPV into its own middle
 eof1BadList.push(
  [
    createEOF1Code
      ([
	"6001" +   // PUSH1 1
        "5E"   +   // RJUMPV, use jump table
        "05"   +   // Number of entries in jump table
        "0000" +   // Relative address, case 0
        "0001" +   // Relative address, case 1
        "0001" +   // Relative address, case 2
        "FFFE" +   // Relative address, case 3
        "0001" +   // Relative address, case 4
        "00" +     // STOP
        "60FF5000" // PUSH1, POP, STOP
       ], [1]
      ), "EOF1I0019"])


// RJUMPV with an empty jump table
 eof1BadList.push(
  [
    createEOF1Code
      ([
	"6001" +   // PUSH1 1
        "5E"   +   // RJUMPV, use jump table
        "00"   +   // Number of entries in jump table
        "60FF5000" // PUSH1, POP, STOP
       ], [1]
      ), "EOF1I0021"])


// Unreachable code fails

// Uncoditional jump
eof1GoodList.push([createEOF1Code(["5C000000"], [0]), ""])
 eof1BadList.push([createEOF1Code(["5C00010000"], [0]), "EOF1I0023"])

// Conditional jump
eof1GoodList.push([createEOF1Code(["60015D000100305000"], [1]), ""])
 eof1BadList.push([createEOF1Code(["60015D00020000305000"], [1]), "EOF1I0023"])

// Jump table
eof1GoodList.push([createEOF1Code(["6001" +
                                   "5E02" +
                                     "0002" +
                                     "0004" +
                                   "3050" +
                                   "3050" +
                                   "3050" +
                                   "00"], [1]), ""])


 eof1BadList.push([createEOF1Code(["6001" +
                                   "5E02" +
                                     "0002" +
                                     "0004" +
                                   "3050" +
                                   "0000" +
                                   "3050" +
                                   "00"], [1]), "EOF1I0023"])



// Stack underflow caused by a function call
temp = createEOF1Code(["3030B0000100", "5050" + "B1"], [2, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
eof1GoodList.push([temp, "EOF1V0007"])

temp = createEOF1Code(["30B0000100", "5050" + "B1"], [1, 2])
temp.code[1].stackInputs = 2
temp.code[1].stackOutputs = 0
 eof1BadList.push([temp, "EOF1I0022"])


// Sections that end with an opcode that isn't an approved terminator fail
eof1GoodList.push([createEOF1Code(["600060006000600000"], [4]), "EOF1V0014"])
eof1GoodList.push([createEOF1Code(["6000600060006000F3"], [4]), "EOF1V0014"])
eof1GoodList.push([createEOF1Code(["6000600060006000FD"], [4]), "EOF1V0014"])
eof1GoodList.push([createEOF1Code(["6000600060006000FE"], [4]), "EOF1V0014"])
eof1GoodList.push([createEOF1Code(["3050B1"], [1]), "EOF1V0014"])
 eof1BadList.push([createEOF1Code(["6000600060006000"], [4]), "EOF1I0024"])
 eof1BadList.push([createEOF1Code(["600060006000600001"], [4]), "EOF1I0024"])
 eof1BadList.push([createEOF1Code(["600060006000600034"], [4]), "EOF1I0024"])
 eof1BadList.push([createEOF1Code(["600060006000600003"], [4]), "EOF1I0024"])
 eof1BadList.push([createEOF1Code(["6000600060006000A4"], [4]), "EOF1I0024"])
 eof1BadList.push([createEOF1Code(["6000600060006000F5"], [4]), "EOF1I0024"])



badContracts = eof1BadList.map(c => [encode(c[0]), c[1]]).
	map(c => [code2init(c[0]), c[1]])
goodContracts = eof1GoodList.map(c => [encode(c[0]), c[1]]).
	map(c => [code2init(c[0]), c[1]])



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
    comment: |
      Ori Pomerantz  qbzzt1@gmail.com
      Implements EOF1I0001, EOF1I0002, EOF1I0003, EOF1I0004, EOF1I0005,
      EOF1I0006, EOF1I0007, EOF1I0008, EOF1I0009, EOF1I0010,
      EOF1I0011, EOF1I0012, EOF1I0013, EOF1I0014, EOF1I0015,
      EOF1I0016, EOF1I0017, EOF1I0018, EOF1I0019, EOF1I0020,
      EOF1I0021, EOF1I0022, EOF1I0023, EOF1I0024, EOF1I0025,
      EOF1V0001, EOF1V0002, EOF1V0003, EOF1V0004, EOF1V0005,
      EOF1V0006, EOF1V0007, EOF1V0008, EOF1V0009, EOF1V0010,
      EOF1V0011, EOF1V0012, EOF1V0013, EOF1V0014, EOF1V0015

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
      # Data ${i}   implements ${code[1]}
      - :label bad  :raw 0x${code[0]}
`).reduce((a,b) => a+b)}

${goodContracts.map((code, i) => `
      # Data ${i+badContracts.length} implements ${code[1]}
      - :label good :raw 0x${code[0]}
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


