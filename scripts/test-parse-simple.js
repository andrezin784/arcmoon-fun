const { parseUnits, formatUnits } = require('viem');

console.log("=== TESTING PARSEUNITS FOR USDC (6 DECIMALS) ===\n");

const tests = [
  { input: "0.001", label: "Minimum" },
  { input: "1", label: "1 USDC" },
  { input: "10", label: "10 USDC" },
  { input: "100", label: "100 USDC" },
];

console.log("Expected behavior:");
console.log("  parseUnits('10', 6) should return 10000000n\n");

tests.forEach(test => {
  console.log(`--- ${test.label} ---`);
  console.log(`Input: "${test.input}"`);
  
  const result = parseUnits(test.input, 6);
  console.log(`parseUnits("${test.input}", 6):`, result.toString());
  
  const expected = BigInt(Math.floor(parseFloat(test.input) * 1000000));
  console.log(`Expected:`, expected.toString());
  console.log(`Match:`, result === expected ? "✅" : "❌");
  console.log(`Formatted back:`, formatUnits(result, 6), "USDC\n");
});

console.log("=== KEY TEST: 10 USDC ===");
const ten = parseUnits("10", 6);
console.log("parseUnits('10', 6):", ten.toString());
console.log("Is 10000000?", ten.toString() === "10000000" ? "✅ YES" : "❌ NO");
console.log("\nIf YES, the bug is NOT in parseUnits.");
console.log("The bug must be in how wagmi/writeContract sends the value.");
