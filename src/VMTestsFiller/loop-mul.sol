pragma solidity ^0.4.0;

contract MulPerformanceTester {

    function testMulMod(uint x, uint y, uint k, uint n) external returns (uint) {
        var r = x;
        for (uint i = 0; i < n; i += 1) {
            r = mulmod(r, y, k);
        }
        return r;
    }
}
