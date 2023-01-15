// Create tests for each arithmetic opcode
// Defined as an opcode where:
// There are 1-3 input values
//           1 output value
//           The output value is only a function of the input values

// number of random tests to add (for opcodes where that makes sense)
const numRandomTests = 5


// If a number, that's the value
// If a string, that's yul code that evaluates to the value
// If it is null, skip the test
type ValueIsh = number | bigint | string


const TWO_POW_256 = 2n**256n
const MAX_SIGNED_INT = 2n**255n-1n


// For two-complement arithmetic
function BigInt_2_String(val: bigint): string {
    const unsignedVal = (val>=0n ? val : val+TWO_POW_256) % TWO_POW_256
    const unsignedStr = unsignedVal.toString(16)
    const bytes = (unsignedStr.length % 2) ? ("0"+unsignedStr) : unsignedStr

    return "0x" + bytes.padStart(12, "0")
}

function str(v : ValueIsh) : string {
    switch(typeof v) {
        case 'string':
            return v
        case 'bigint':
            return BigInt_2_String(v)
        case 'number':
            return v.toString()
    }
}



interface OpcodeBasics {
    name: string;
}

interface Arith extends OpcodeBasics {
    // Stack outputs
    sOut: 1;

    // Immediate inputs (bytes)
    // (PUSH and RJUMP? are the only ones currently)
    iIn: 0;

    testIn : ValueIsh[];
    testOut : ValueIsh;
}

interface Arith1 extends Arith {    
    kind: "Arith1";
    sIn: 1;
}

interface Arith2 extends Arith {    
    kind: "Arith2";
    sIn: 2;
}

interface Arith3 extends Arith {    
    kind: "Arith3";
    sIn: 3;
}

type ArithTest = Arith1 | Arith2 | Arith3 | null


function makeArith1(name: string, 
    testIn: ValueIsh, testOut: ValueIsh) : ArithTest {

    if (testOut == null)
        return null

    return {
        name: name,
        sIn: 1,
        sOut: 1,
        iIn: 0,
        kind: "Arith1",
        testIn: [ str(testIn) ],
        testOut: str(testOut),        
    }
}



function makeArith2(name: string, 
    testIn1: ValueIsh, testIn2: ValueIsh, testOut: ValueIsh) : ArithTest {

    if (testOut == null)
        return null

    return {
        name: name,
        sIn: 2,
        sOut: 1,
        iIn: 0,
        kind: "Arith2",
        testIn: [ str(testIn1), str(testIn2)],
        testOut: str(testOut),        
    }
}



function makeArith3(name: string, 
    testIn1: ValueIsh, testIn2: ValueIsh, testIn3: ValueIsh, testOut: ValueIsh) : ArithTest {

    if (testOut == null)
        return null

    return {
        name: name,
        sIn: 3,
        sOut: 1,
        iIn: 0,
        kind: "Arith3",
        testIn: [ str(testIn1), str(testIn2), str(testIn3)],
        testOut: str(testOut),        
    }
}



function randValue(max : number) : bigint {
    return BigInt(Math.floor(Math.random() * max))
}



function makeArith2Random(  name: string, 
                            max: number, 
                            calcResult: (a: ValueIsh, b:ValueIsh) => ValueIsh) 
    : ArithTest {
        const a = randValue(max)
        const b = randValue(max)
        return makeArith2(name, a, b, calcResult(a,b))
}


// Make arith2 tests, a few with small numbers and then a few with random
// big numbers (positive and negative). This is not appropriate for exp because 
// the second parameter shouldn't be too big.
function makeArith2Tests(   
    name: string, 
    max: number, 
    calcResult: (a: bigint, b:bigint) => bigint) : ArithTest[]
{
    let retVal: ArithTest[] = []

    for(let i=-4n; i<5n; i++)
        for(let j=-4n; j<5n; j++) {
            retVal.push( makeArith2(name, BigInt_2_String(i), BigInt_2_String(j), calcResult(i,j)) )
            retVal.push( makeArith2(name, i*0x100n, j, calcResult(i*0x100n,j)) )
            retVal.push( makeArith2(name, i, j*0x100n, calcResult(i,j*0x100n)) )            
            retVal.push( makeArith2(name, i*0x100n, j*0x100n, calcResult(i*0x100n,j*0x100n)) )            
        }
        
    
    if (max) {
        for(let i=0; i<numRandomTests; i++)
            retVal.push(makeArith2Random(name, max, calcResult))
    }

    return retVal
}


function test2Cond(test : ArithTest) : string {
    switch (test.kind) {
        case 'Arith1':
            return `iszero(eq(${test.name}(${test.testIn[0]}), 
                ${test.testOut}))`        
        case 'Arith2':
            return `iszero(eq(${test.name}(
                  ${test.testIn[0]},
                  ${test.testIn[1]}), 
               ${test.testOut}))`
        case `Arith3`:
            return `iszero(eq(${test.name}(
                  ${test.testIn[0]},
                  ${test.testIn[1]},
                  ${test.testIn[2]}), 
               ${test.testOut}))`
    }
}


function test2Yul(test: ArithTest, serial: number) : string {

    if (test == null) return ""

    return `
// Test case ${serial+1} = 0x${(serial+1).toString(16)}
if ${test2Cond(test)} {
    errors := add(errors,1)
    sstore(errors, ${serial+1})
}
`
}

function tests2Yul(tests : ArithTest[]): string {
    return tests.map(test2Yul).reduce((a,b) => a+b)
}


function fullYul(yul: string): string {
    return `
let errors := 0

${yul}

sstore(0, errors)
`
}


let tests: ArithTest[] = []

// Turn a value that may be negative into a value for unsigned arithmetic
function unsign(val: bigint): bigint {
    return val<0 ? val+TWO_POW_256 : val
}

// Simple 2 input arithmetic:
// add,sub,mul,[s]div,[s]mod
tests = tests.concat(makeArith2Tests("add", Math.pow(2,64), (a,b) => a+b))
tests = tests.concat(makeArith2Tests("mul", Math.pow(2,32), (a,b) => a*b))
tests = tests.concat(makeArith2Tests("sub", Math.pow(2,32), (a,b) => a>=b ? a-b : null))
tests = tests.concat(makeArith2Tests("div", Math.pow(2,64), 
                                    (a,b) => b == 0n ? 0n : unsign(a)/unsign(b)))
tests = tests.concat(makeArith2Tests("sdiv", Math.pow(2,64), 
                                    (a,b) => b == 0n ? 0n : a/b))
tests = tests.concat(makeArith2Tests("mod", Math.pow(2,64),
                                    (a,b) => b == 0n ? 0n : unsign(a) % unsign(b)))
tests = tests.concat(makeArith2Tests("smod", Math.pow(2,64),
                                    (a,b) => b == 0n ? 0n : a%b))



// exp tests (makeArith2Tests won't work because it would produce excessive high values)
for(let i=0n; i<20n; i++)
   for(let j=0n; j<32n; j++) {
      tests.push(makeArith2("exp", i, j, i**j))
      tests.push(makeArith2("exp", i*0x100n, j, (i*0x100n)**j))      
   }
tests.push(makeArith2("exp", 2n, 256n, 0n))


// signextend
// Byte 0 here is the least significant, byte 31 the most significant
for(var i=0n; i<128n; i++) {
	tests.push(makeArith2("signextend", 0n, i, i))
	tests.push(makeArith2("signextend", 0n, 128n+i, i-128n))
	tests.push(makeArith2("signextend", 1n, i, i))
	tests.push(makeArith2("signextend", 1n, 128n+i, 128n+i))
}


// Conditionals
tests = tests.concat(makeArith2Tests("lt", Math.pow(2,64),
            (a,b) => unsign(a)<unsign(b) ? 1n : 0n))
tests = tests.concat(makeArith2Tests("gt", Math.pow(2,64),
            (a,b) => unsign(a)>unsign(b) ? 1n : 0n))
tests = tests.concat(makeArith2Tests("slt", Math.pow(2,64),
            (a,b) => a<b                 ? 1n : 0n))
tests = tests.concat(makeArith2Tests("sgt", Math.pow(2,64),
            (a,b) => a>b                 ? 1n : 0n))
tests = tests.concat(makeArith2Tests("eq", Math.pow(2,64),
            (a,b) => a==b                ? 1n : 0n))


// Bitwise boolean
tests = tests.concat(makeArith2Tests("and", Math.pow(2,64), (a,b) => a&b))
tests = tests.concat(makeArith2Tests("or",  Math.pow(2,64), (a,b) => a|b))
tests = tests.concat(makeArith2Tests("xor", Math.pow(2,64), (a,b) => a^b))


// Byte 
// Byte 0 here is the most significant byte, byte 31 is the least significant
for(var i=0n; i<32n; i++)
    tests.push(makeArith2("byte", 
                               i, 
        0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20n, 
                               i+1n))



// Shifts (left and right)
for(var i=0n; i<255n; i++) {
    const rand = randValue(2**64)
    tests.push(makeArith2("shl", i, 1n, 2n**i)) 
    tests.push(makeArith2("shl", i, rand, rand*(2n**i))) 
    tests.push(makeArith2("shr", i, 2n**255n, 2n**(255n-i)))
    tests.push(makeArith2("shr", i, rand, rand/(2n**i))) 
}


// Arithmetic shift right (if the most significant bit is on, put 1's in
// the most significant part of the result, not 0's
for(var i=0n; i<255n; i++) {
    const rand = randValue(2**64)
    tests.push(makeArith2("sar", i, 2n**254n, 2n**(254n-i)))
    tests.push(makeArith2("sar", i, rand, rand/(2n**i))) 
    tests.push(makeArith2("sar", i, 2n**255n, 2n**256n - 2n**(255n-i)))
}

// Arith1 - single parameter opcodes
tests.push(makeArith1("iszero", 0, 1))
tests.push(makeArith1("iszero", 1, 0))
tests.push(makeArith1("iszero", 0x100, 0))
tests.push(makeArith1("iszero", -1n, 0))
for (let i=0; i<5; i++)
    tests.push(makeArith1("iszero", randValue(2**64), 0))

tests.push(makeArith1("not", 0, -1n))
tests.push(makeArith1("not", -1n, 0))
for (let i=0; i<200; i++) {
    let rand = randValue(2**64)
    tests.push(makeArith1("not", rand, ~rand))
}

// Arith3 - three parameters

function addmod(a,b,c: bigint): bigint {
   if (c==0n) return 0n
   return (a+b)%c
}

function mulmod(a,b,c: bigint): bigint {
   if (c==0n) return 0n

   // It makes no sense for a*b to be number when a and b are both
   // bigint, but I don't have time to debug typescript
   return BigInt(a*b)%c
}


for(let i=0; i<200; i++) {
  // a and b are 0-2**32 because of a weird bug in mulmod that makes the result
  // number instead of bigint
  const a = randValue(2**32)
  const b = randValue(2**32)
  const c = randValue(2**32)
  tests.push(makeArith3("addmod", a, b, c, addmod(a,b,c)))
  tests.push(makeArith3("mulmod", a, b, c, mulmod(a,b,c)))
}

console.log(fullYul(tests2Yul(tests)))

console.log('/* ')

const testNums : string[] = [
"0001",
"0002",
"0003",
"0004",
"0005",
"0006",
"0007",
"0008",
"0009",
"0010",
"0011",
"0016",
"0017",
"0018",
"0019",
"0020",
"0021",
"0022",
"0023",
"0024",
"0025",
"0026",
"0027",
"0028",
"0029"
]


console.log(testNums.map(x => `Implements: OPCOD${x}`).reduce((a,b) => `${a}
${b}`))

console.log('*/')
