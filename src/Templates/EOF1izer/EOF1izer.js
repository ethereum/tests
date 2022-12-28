#! /usr/bin/node

// Convert code (and possibly data) from legacy to EOF1
// As per https://eips.ethereum.org/EIPS/eip-3540
//
// code - command line parameter, or default (STOP)
// data - command line parameter, export data=0x... in the env, or empty

// For locations in the list
const CODE=0
const DATA=1

// Read input. Use a list with code followed by data
input = [ process.argv[2] || "0x00", process.argv[3] || process.env.data || "0x"]

// Remove 0x if it's there
input = input.map(x => x.replace("0x", ""))

// Get the lengths
lengths = input.map(x => x.length/2)

// Convert length, each is a two byte value
lengths = lengths.map(x => x.toString(16).padStart(4, "0"))

// 0xEF000101000402000100030300020000000010335000DA7A

boilerplate1 = '0xEF0001010004020001'
boilerplate2 = '03'
boilerplate3 = '0000000400'    // hardcode max stack to 0x0400

result = boilerplate1 + lengths[CODE] + boilerplate2 + lengths[DATA] +
         boilerplate3 + input[CODE] + input[DATA]

console.log(result)
