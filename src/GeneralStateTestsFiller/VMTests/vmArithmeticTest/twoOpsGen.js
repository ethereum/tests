#! /usr/bin/node

// Generate the vmArithmeticTest/twoOpsFiller.yml file
//
// Ori Pomerantz qbzzt1@gmail.com
//
// This test looks at the result of running two operations (numeric/bitwise)
// There are 24 such operations, so 576 test cases.


// Turn boolean values into the numbers the evm gives us
const bool2num = a => a ? 1n : 0n

// The EVM is 256 bits, and uses 2's complement for negatives.
// JavaScript BigInt, OTOH, can be a lot more (it seems to depend on the size of
// the biggest operand).
// In the few cases where the sign matters these functions convert between representations.

// The unsigned value is always the least significant 256 bits
const makeUnsigned = a => a & (2n**256n-1n)

// The signed value can be either positive (no change) or negative. If it's
// negative, the most significant bit is on. In that case, use 2's complement
// to figure the absolute value and then negate it.
const makeSigned =   a => (a & 2n**255n) ? -(makeUnsigned(~a)+1n) : a


// The numeric/bitwise opcodes we test. For each we have:
//
// name
// number of parameters it receives
// Javascript function to implement it so we'll be able to know what result to expect

var opcodes = [
    ["ADD",         2, (a,b) => a+b],
    ["MUL",         2, (a,b) => a*b],
    ["SUB",         2, (a,b) => a-b],
    ["DIV",         2, (a,b) => a/b],
    ["SDIV",        2, (a,b) => makeUnsigned(makeSigned(a)/makeSigned(b))],
    ["MOD",         2, (a,b) => a % b],
    ["SMOD",        2, (a,b) => makeUnsigned(makeSigned(a) % makeSigned(b))],
    ["ADDMOD",      3, (a,b,c) => (a+b) % c],
    ["MULMOD",      3, (a,b,c) => (a*b) % c],
    ["EXP",         2, (a,b) => a**b],
    ["LT",          2, (a,b) => bool2num(a<b)],
    ["GT",          2, (a,b) => bool2num(a>b)],
    ["SLT",         2, (a,b) => bool2num(makeSigned(a)<makeSigned(b))],
    ["SGT",         2, (a,b) => bool2num(makeSigned(a)>makeSigned(b))],
    ["EQ",          2, (a,b) => bool2num(a==b)],
    ["ISZERO",      1, a => bool2num(a == 0)],
    ["AND",         2, (a,b) => a&b],
    ["OR",          2, (a,b) => a|b],
    ["XOR",         2, (a,b) => a^b],
    ["NOT",         1, a => makeUnsigned(~a)],
    ["BYTE",        2, (i,x) => i > 32 ? 0 : (x >> (248n - i*8n)) & 255n],
    ["SHL",         2, (a,b) => (a > 255n) ? 0 : b << a],
    ["SHR",         2, (a,b) => b >> a],
    ["SAR",         2, (a,b) => b >> a],
       ]



// Turn an opcode line into LLL code with these values. a,b,c are code structures
// Code structures contain two fields:
// lll - the LLL code for the operation
// val - the numeric result (as a BigInt)
const opcode2Code = (op, a, b, c) => {

  // The result depends on the number of parameters the opcode accepts
  switch(op[1]) {
    case 1:
      return { lll: `(${op[0]} ${a.lll})`, val: op[2](a.val) }
      break;
    case 2:
      return { lll: `(${op[0]} ${a.lll} ${b.lll})`, val: op[2](a.val,b.val) }
      break;
    case 3:
      return { lll: `(${op[0]} ${a.lll} ${b.lll} ${c.lll})`, val: op[2](a.val,b.val,c.val) }
      break;
  }    // switch(op[1])
}   // opcode2Code


// The values we use as operands
one = {lll: "1", val: BigInt(1)}
two = {lll: "2", val: BigInt(2)}
three = {lll: "3", val: BigInt(3)}


const boilerPlate1 = `
twoOps:

  env:
    currentCoinbase: 2adc25665018aa1fe0e6bc666dac8fc2697ff9ba
    currentDifficulty: 0x20000
    currentGasLimit: 100000000
    currentNumber: 1
    currentTimestamp: 1000
    previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6

  _info:
    comment: Ori Pomerantz qbzzt1@gmail.com

  pre:
`

const boilerPlate2 = `
    # Call different contracts depending on the parameter
    cccccccccccccccccccccccccccccccccccccccc:
      code: |
        {
            (call (gas) $4 0 0 0 0 0)
        }
      nonce: 1
      storage: {}
      balance: 0

    a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
      balance: '0x0ba1a9ce0ba1a9ce'
      code: '0x'
      nonce: '0'
      storage: {}


  transaction:
    data:
    # The parameter's value is the contract to call.
`

const boilerPlate3 = `
    gasLimit:
    - '80000000'
    gasPrice: '1'
    nonce: '0'
    to: cccccccccccccccccccccccccccccccccccccccc
    value:
    - '1'
    secretKey: "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"


  expect:
`


// Create the contract to test a specific combination
const createOpcodeTest = (op1Num, op2Num) => {
    // The 20 byte address, different for each opcode
    addr = (0x10000 + 0x100*op1Num + op2Num).toString(16).padStart(40, '0')

    op1 = opcodes[op1Num]
    op2 = opcodes[op2Num]

    intermediate = opcode2Code(op2, two, one, three)
    code0 = opcode2Code(op1, intermediate, three, two)
    code1 = opcode2Code(op1, intermediate, one, two)


    // This structure contains three fields:
    // pre - the contract to place into the pre section
    // data - the transaction label and data, to place into the transaction.data section
    // expect - the result to place into the expect section (along with the correct label)
    return {
      pre: `
    # ${op1[0]}-${op2[0]}
    # a <- ${op2[0]} 2 1 3      (${intermediate.val})
    # [[0]] <- ${op1[0]} a 3 2  (${code0.val})
    # [[1]] <- ${op1[0]} a 1 2  (${code1.val})
    #
    # In all cases we ignore unneeded parameters
    #
    ${addr}:
      balance: 0
      code: |
        {
              [[0]] ${code0.lll}
              [[1]] ${code1.lll}
        }
      nonce: 1
      storage: {}
`,
      data: `
    - :label ${op1[0]}-${op2[0]} :abi f(uint) 0x${addr}`,
      expect: `
    - indexes:
        data: :label ${op1[0]}-${op2[0]}
        gas:  !!int -1
        value: !!int -1
      network:
        - '>=Istanbul'
      result:
        ${addr}:
          storage:
            0x00: ${code0.val}
            0x01: ${code1.val}
`
    }   // return {}

}        // createOpcodeTest


// The variables that will collect the output
// of createOpcodeTest
var preCollector = ""
var dataCollector = ""
var expectCollector = ""


// For every opcode pair we can get from the list
for (var op1Num=0; op1Num<opcodes.length; op1Num++)
    for (var op2Num=0; op2Num<opcodes.length; op2Num++) {
      temp = createOpcodeTest(op1Num, op2Num)

      preCollector += temp.pre
      dataCollector += temp.data
      expectCollector += temp.expect
    }    // for every opcode pair


console.log(boilerPlate1)
console.log(preCollector)
console.log(boilerPlate2)
console.log(dataCollector)
console.log(boilerPlate3)
console.log(expectCollector)

