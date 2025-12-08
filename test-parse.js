// Test script to debug parseUnits
const { parseUnits, formatUnits } = require('viem');

console.log("=== TESTING PARSEUNITS ===\n");

// Test with different amounts
const testAmounts = ["1", "10", "100", "0.5", "10.123456"];

testAmounts.forEach(amount => {
  console.log(`Input: "${amount}"`);
  
  try {
    const parsed6 = parseUnits(amount, 6);
    console.log(`  parseUnits(${amount}, 6) = ${parsed6.toString()}`);
    console.log(`  Formatted back: ${formatUnits(parsed6, 6)} USDC`);
    
    // Manual calculation
    const manual = Math.floor(parseFloat(amount) * 1000000);
    console.log(`  Manual calc (x 10^6) = ${manual}`);
    console.log(`  Match: ${parsed6.toString() === manual.toString() ? '✅' : '❌'}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
  console.log("");
});

console.log("=== Expected for 10 USDC ===");
console.log("Should be: 10000000");
console.log("In hex: 0x" + (10000000).toString(16));
