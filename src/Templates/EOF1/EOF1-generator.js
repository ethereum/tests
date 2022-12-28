#! /usr/bin/node

// Create EOF1 code, with values that are valid and invalid in various fields.
// based on https://github.com/lightclient/go-ethereum/blob/eof/core/vm/eof.go


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
         code: "403000",
         stackInputs: 0,
         stackOutputs: 0,
         maxStack: 1024
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

eof1BadVersion0 = cloneEof1Good()
eof1BadVersion0.version = 0

eof1BadVersion2 = cloneEof1Good()
eof1BadVersion0.version = 2

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


// Good (valid) EOF1's

eof1TwoCode = cloneEof1Good()
eof1TwoCode.sections[0].size = 8
eof1TwoCode.sections[1].size = 2
eof1TwoCode.sections[1].lengths = [3, 5]
eof1TwoCode.code = [
   eof1Good.code[0],
   eof1Good.code[0]
]
eof1TwoCode.code[1].code = "3030505000"


eof1FourCode = cloneEof1Good()
eof1FourCode.sections[0].size = 16
eof1FourCode.sections[1].size = 4
eof1FourCode.sections[1].lengths = [3, 3, 3, 3]
eof1FourCode.code = [
   eof1Good.code[0],
   eof1Good.code[0],
   eof1Good.code[0],
   eof1Good.code[0]
]


console.log("Bad")
console.log(encode(eof1BadMagic))
console.log(encode(eof1BadVersion0))
console.log(encode(eof1BadVersion2))
console.log(encode(eof1BadSectionOrder))
console.log(encode(eof1BadEndOfSections))
console.log(encode(eof1NoCodeSection))
console.log(encode(eof1NoDataSection))
console.log(encode(eof1InconsistentCodeSec))
console.log(encode(eof1ExtraBytes))
console.log(encode(eof1DataTooShort))
console.log(encode(eof1WierdSectionSize))

console.log("Good")
console.log(encode(eof1Good))
console.log(encode(eof1TwoCode))
console.log(encode(eof1FourCode))



