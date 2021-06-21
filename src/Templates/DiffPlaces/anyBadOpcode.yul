// Run an invalid opcode (make sure it doesn't fail due to a stack underflow) and then
// kill the goat if we don't revert.


verbatim_9i_0o(hex"XX", 1, 2, 3, 4, 5, 6, 7, 8, 9)

// If we get here, kill the goat so we'll get an error
mstore(0, hex"DEAD60A7")
