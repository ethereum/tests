#! /usr/bin/node

// Create a random evm test
//
// Ori Pomerantz qbzzt1@gmail.com

// Test parameters
const testNum = 20        // Number of tests to create
const testLength = 100    // Number of operations in the test
const minStack = 10       // Tests that produce a stack smaller than this don't count


// Various addresses
const callerAddr =   "cccccccccccccccccccccccccccccccccccccccc"
const userAddr =     "a94f5374fce5edbc8e2a8697c15331677e6ebf0b"
const coinbaseAddr = "2adc25665018aa1fe0e6bc666dac8fc2697ff9ba"

// The start of the random test contracts
const baseAddr =     "ba5e000000000000000000000000000000000000"


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


// For each operation:

// name
// byte(s) for the opcode
// minimum stack depth at which it is valid
// Javascript function to implement it so we'll be able to know what result to expect

const opsName = 0
const opsCode = 1
const opsMinDepth = 2
const opsFun = 3

// Functions to implement changes in the stack
const oneOperand = (stack, fun) => stack.slice(0,-1).
        concat(makeUnsigned(BigInt(fun(stack[stack.length-1]))))

const twoOperand = (stack, fun) => stack.slice(0,-2).
        concat(makeUnsigned(BigInt(fun(stack[stack.length-1], stack[stack.length-2]))))

const threeOperand = (stack, fun) => stack.slice(0,-3).
        concat(makeUnsigned(BigInt(fun(stack[stack.length-1],
                                       stack[stack.length-2],
                                       stack[stack.length-3]))))

const stackPush = (stack, val) => stack.concat(BigInt(val))



var ops = [
  ["ADD",  "01", 2, stack => twoOperand(stack, (a,b) => a+b)],
  ["MUL",  "02", 2, stack => twoOperand(stack, (a,b) => a*b)],
  ["SUB",  "03", 2, stack => twoOperand(stack, (a,b) => a-b)],
  ["DIV",  "04", 2, stack => twoOperand(stack, (a,b) =>
       b == 0n ? 0n : a/b)],
  ["SDIV", "05", 2, stack => twoOperand(stack, (a,b) =>
       b == 0n ? 0n : makeSigned(a)/makeSigned(b))],
  ["MOD",  "06", 2, stack => twoOperand(stack, (a,b) =>
       b == 0n ? 0n : a % b)],
  ["SMOD", "07", 2, stack => twoOperand(stack, (a,b) =>
      b == 0n ? 0n : makeSigned(a) % makeSigned(b) )],
  ["LT",          '10', 2, stack => twoOperand(stack, (a,b) => bool2num(a<b))],
  ["GT",          '11', 2, stack => twoOperand(stack, (a,b) => bool2num(a>b))],
  ["SLT",         '12', 2, stack => twoOperand(stack, (a,b) => bool2num(makeSigned(a)<makeSigned(b)))],
  ["SGT",         '13', 2, stack => twoOperand(stack, (a,b) => bool2num(makeSigned(a)>makeSigned(b)))],
  ["EQ",          '14', 2, stack => twoOperand(stack, (a,b) => bool2num(a==b))],
  ["AND",         '16', 2, stack => twoOperand(stack, (a,b) => a&b)],
  ["OR",          '17', 2, stack => twoOperand(stack, (a,b) => a|b)],
  ["XOR",         '18', 2, stack => twoOperand(stack, (a,b) => a^b)],
  ["SHL",         '1b', 2, stack => twoOperand(stack, (a,b) => (a > 255n) ? 0 : b << a)],
  ["SHR",         '1c', 2, stack => twoOperand(stack, (a,b) => b >> a)],
  ["BYTE",        '1a', 2, stack => twoOperand(stack,
            (i,x) => i > 32n ? 0 : (x >> (248n - i*8n)) & 255n)],
  ["ISZERO",      '15', 1, stack => oneOperand(stack, a => bool2num(a == 0))],
  ["NOT",         '19', 1, stack => oneOperand(stack, a => makeUnsigned(~a))],
  ["ADDMOD",      '08', 3, stack => threeOperand(stack, (a,b,c) => c == 0 ? 0 : (a+b) % c)],
  ["MULMOD",      '09', 3, stack => threeOperand(stack, (a,b,c) => c == 0 ? 0 : (a*b) % c)],

  // EXP of random values is likely to lead to numbers too big for BigInt.
  // so instead we just check specific powers
  ["PUSH1 1 ; SWAP1 ; EXP", "6001900A", 1, stack => stack],
  ["PUSH1 2 ; SWAP1 ; EXP", "6002900A", 1, stack => oneOperand(stack, a => a*a)],
  ["PUSH1 3 ; SWAP1 ; EXP", "6003900A", 1, stack => oneOperand(stack, a => a*a*a)],

  // Various transaction related parameters
  // ["ADDRESS",       "30", 0, stack => stackPush(stack, BigInt("0x"+ourAddr))],
  ["ORIGIN",        "32", 0, stack => stackPush(stack, BigInt("0x"+userAddr))],
  ["CALLER",        "33", 0, stack => stackPush(stack, BigInt("0x"+userAddr))],
  ["CALLVALUE",     "34", 0, stack => stackPush(stack, 0n)],
  ["GASPRICE",      "3A", 0, stack => stackPush(stack, 1n)],
  ["RETURNDATASIZE","3D", 0, stack => stackPush(stack, 0n)],
  ["COINBASE",      "41", 0, stack => stackPush(stack, BigInt("0x"+coinbaseAddr))],
  ["TIMESTAMP",     "42", 0, stack => stackPush(stack, 1000n)],
  ["NUMBER",        "43", 0, stack => stackPush(stack, 1n)],
  ["DIFFICULTY",    "44", 0, stack => stackPush(stack, 0x20000n)],
  ["GASLIMIT",      "45", 0, stack => stackPush(stack, 100000000n)],
  ["POP",           "50", 1, stack => stack.slice(0,-1)],
  ["JUMPDEST",      "5B", 0, stack => stack],

  // To avoid dealing with memory, we only do SHA3 of empty buffers
  ["SHA3",          "6000600020", 0, stack => stackPush(stack,
                  BigInt("0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"))]

]   // ops




// Problem opcodes:

// Need to implement:
// SIGNEXTEND
//  ["SAR",         '1d', 2, stack => twoOperand(stack, (a,b) => b >> a)],

// Uses memory:
//   CALLDATACOPY
//   CODECOPY
//   RETURNDATACOPY
//   MSTORE, MSTORE8, MLOAD
//   SSTORE, SLOAD
//   MSIZE
//
// Requires all addrs
//   BALANCE
//   EXTCODESIZE
//   EXTCODEHASH
//
// Other
//   CALLDATALOAD
//   CALLDATASIZE
//   CODESIZE
//   BLOCKHASH
//   JUMP
//   JUMPI
//   PC
//   GAS
//   CALL (all four versions)
//   CREATE (both versions)
//   REVERT
//   RETURN
//   SELFDESTRUCT
//   ADDRESS
//
//  Likely to cause overflow because of using random (potentially very high) mem
//  ["LOG0",          "A0", 2, stack => stack.slice(0,-2)],
//  ["LOG1",          "A1", 3, stack => stack.slice(0,-3)],
//  ["LOG2",          "A2", 4, stack => stack.slice(0,-4)],
//  ["LOG3",          "A3", 5, stack => stack.slice(0,-5)],
//  ["LOG4",          "A4", 6, stack => stack.slice(0,-6)],

const randomElement = list => list[Math.floor(Math.random()*list.length)]


const randByte = () => randomElement("0123456789ABCDEF") + randomElement("0123456789ABCDEF")


// Make a push op for 0<n<=0x20 bytes and add it to ops
const addPushOp = n => {
  var val = "";

  for(var i=0; i<n; i++)
    val += randByte()

  const opcode = (0x5F+n).toString(16)
  ops.push(
     [`PUSH${n} 0x${val}`, `${opcode}${val}`, 0, stack => stackPush(stack, BigInt(`0x${val}`))]
  )
}

for (var i=1; i<=0x2 /*0*/; i++)
    addPushOp(i)


// The stack modification function for DUPn
const dup = n => (stack => stackPush(stack, stack[stack.length-n]))


// Add the DUPs
for(var i=1; i<=0x10; i++)
  ops.push (
    // If we use i inside a function definition we get the value at time the function
    // is evaluated, not when it is created (probably because i is a global).
    // This way it is a parameter and the function is the correct one
    [`DUP${i}`, (0x7F+i).toString(16), i, dup(i)]
  )


// The stack modification function for SWAPn
const swap = n => (stack => {
    var temp = stack[stack.length-1]
    stack[stack.length-1] = stack[stack.length-1-n]
    stack[stack.length-1-n] = temp

    return stack
})


// Add the SWAPs
for(var i=1; i<=0x10; i++)
  ops.push (
    // If we use i inside a function definition we get the value at time the function
    // is evaluated, not when it is created (probably because i is a global).
    // This way it is a parameter and the function is the correct one
    [`SWAP${i}`, (0x8F+i).toString(16), i+1, swap(i)]
  )




// Given a stack, pick a random operation that won't cause an underflow
const randomOp = stack => {
  var op = randomElement(ops)

  // Make sure our op doesn't underflow the stack
  while (op[opsMinDepth] > stack.length)
    op = randomElement(ops)

  return op
}


// Create an n operation program, return it and the stack
const randomProg = n => {
   var code = ""
   var trace = ""
   var stack = []

   for(var i=0; i<n; i++) {
     const op = randomOp(stack)
     code += op[opsCode]
     stack = op[opsFun](stack)
     trace += `
    # ${op[opsName]}
    # ${stack.map(x => x.toString(16))}
    # -------------------------------------`
   }

  return {code, trace, stack}
}



// Create the code to check the stack
const checkStack = stack => {
  var code = "6001"   // Start by pushing one
  var trace = `
    # Checking the values:
    # PUSH1 1`

  for(var i = stack.length-1; i>=0; i--) {
     // Push the value we expect to find
     code += "7F" + stack[i].toString(16).padStart(64,"0")

     // The code explained in the trace. If everything is correct,
     // we'll end with the remaining stack followed by a 1.
     code += "90911416"
     trace += `
    #                          stack: ... val, 1
    # PUSH32 ${stack[i]}       stack: ... val, 1, expectedVal
    # SWAP1                    stack: ... val, expectedVal, 1
    # SWAP2                    stack: ... 1, expectedVal, val
    # EQ                       stack: ... 1, 1
    # AND                      stack: ... 1`
  }

  // Store the result
  code += "600055"
  trace += `
    # PUSH1 0
    # SSTORE`

  return { code, trace }
}


// Make a test (including both the random program and the code that verifies
// the stack)
const makeTest = (testLength, minStack) => {
    var prog = randomProg(testLength)

    // Make sure that we have at least n values in the stack
    while(prog.stack.length < minStack)
       prog = randomProg(testLength)

    var test = checkStack(prog.stack)

    return {
       code: prog.code+test.code,
       trace: prog.trace+test.trace
    }
}


// Make the required number of tests
tests = []

for(var i=0; i<testNum; i++) {
    var test = makeTest(testLength, minStack)
    tests.push({
       code: test.code,
       trace: test.trace,
       addr: baseAddr.slice(0,-4)+i.toString().padStart(4,0)
    })
}


// Get the contract lines
const getContracts = tests => {
  var res = ""
  for(var i=0; i<tests.length; i++)
    res += `
    # ${tests[i].addr}${tests[i].trace}
    ${tests[i].addr}:
      code: :raw 0x${tests[i].code}
      nonce: 1
      storage: {}
      balance: 0
    `

  return res
}


// Get the lines for the transaction.data field
const getData = tests => {
  var res = ""
  for(var i=0; i<tests.length; i++)
    res += `
    - :abi f(uint) 0x${tests[i].addr}`

  return res

} 


const filler = `
random:
  # Generated automatically by randomGen.js
  # Number of tests: ${testNum}
  # Test length: ${testLength}
  # Minimum acceptable output stack: ${minStack}

  env:
    currentCoinbase: ${coinbaseAddr}
    currentDifficulty: 0x20000
    currentGasLimit: 100000000
    currentNumber: 1
    currentTimestamp: 1000
    previousHash: 5e20a0453cecd065ea59c37ac63e079ee08998b6045136a8ce6635c7912ec0b6

  _info:
    comment: Ori Pomerantz qbzzt1@gmail.com

  pre:
    a94f5374fce5edbc8e2a8697c15331677e6ebf0b:
      balance: '0x0ba1a9ce0ba1a9ce'
      code: '0x'
      nonce: 1
      storage: {}

${getContracts(tests)}

    # Call one of the random programs
    cccccccccccccccccccccccccccccccccccccccc:
      code: |
       {
          (delegatecall (gas) $4 0 0 0 0)
       }
      nonce: 1
      storage: {}
      balance: 0



  transaction:
    data: ${getData(tests)}
    gasLimit:
    - '80000000'
    gasPrice: '1'
    nonce: 1
    to: cccccccccccccccccccccccccccccccccccccccc
    value:
    - 0
    secretKey: "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8"


  expect:
   - indexes:
        data: !!int -1
        gas:  !!int -1
        value: !!int -1
     network:
        - '>=Istanbul'
     result:
        cccccccccccccccccccccccccccccccccccccccc:
          storage:
            0: 1
`


console.log(filler)
