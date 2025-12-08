const { createPublicClient, http, parseUnits, formatUnits } = require('viem');
const { MOON_TOKEN_ABI, MOON_FACTORY_ABI } = require('../lib/contracts');

// Arc Testnet config
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 6, name: 'USDC', symbol: 'USDC' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
};

async function testBuy10USDC() {
  console.log("=== TEST BUY 10 USDC (Arc Testnet) ===\n");

  // Setup client
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network'),
  });

  const FACTORY_ADDRESS = '0x8731E90f8b4128018Bfff2d0EB14B27Fb108B9Bc';

  console.log("Factory:", FACTORY_ADDRESS);

  // Get recent token
  const tokens = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: MOON_FACTORY_ABI,
    functionName: 'getRecentTokens',
    args: [1n],
  });

  if (tokens.length === 0) {
    console.log("❌ No tokens found. Create one first!\n");
    console.log("=== TESTING PARSEUNITS ANYWAY ===\n");
    
    // Test parseUnits even without token
    const testAmount = parseUnits("10", 6);
    console.log("Input: '10'");
    console.log("parseUnits('10', 6):", testAmount.toString());
    console.log("Expected: 10000000");
    console.log("Match:", testAmount.toString() === "10000000" ? "✅ CORRECT" : "❌ WRONG");
    console.log("\nFormatted back:", formatUnits(testAmount, 6), "USDC");
    
    return;
  }

  const tokenAddress = tokens[0];
  console.log("Token:", tokenAddress, "\n");

  // Get token info
  const tokenInfo = await publicClient.readContract({
    address: tokenAddress,
    abi: MOON_TOKEN_ABI,
    functionName: 'getTokenInfo',
  });

  console.log("Token Name:", tokenInfo[0]);
  console.log("Token Symbol:", tokenInfo[1]);
  console.log("Current Price:", formatUnits(tokenInfo[7], 6), "USDC\n");

  // TEST: 10 USDC
  const amountUSDC = parseUnits("10", 6);
  console.log("--- TEST INPUT ---");
  console.log("Input String: '10'");
  console.log("parseUnits('10', 6):", amountUSDC.toString(), "units");
  console.log("Expected: 10000000 units");
  console.log("Match:", amountUSDC.toString() === "10000000" ? "✅ CORRECT" : "❌ WRONG");
  console.log("In USDC:", formatUnits(amountUSDC, 6), "USDC\n");

  // Calculate tokens out
  const tokensOut = await publicClient.readContract({
    address: tokenAddress,
    abi: MOON_TOKEN_ABI,
    functionName: 'calculateTokensForPayment',
    args: [amountUSDC],
  });

  console.log("--- BONDING CURVE CALC ---");
  console.log("Tokens Out:", formatUnits(tokensOut, 18));
  console.log("Min Tokens (1% slippage):", formatUnits((tokensOut * 99n) / 100n, 18), "\n");

  console.log("=== SUMMARY ===");
  console.log("✅ parseUnits works correctly");
  console.log("✅ Should send:", amountUSDC.toString(), "units (", formatUnits(amountUSDC, 6), "USDC)");
  console.log("✅ Should receive:", formatUnits(tokensOut, 18), "tokens");
}

testBuy10USDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("ERROR:", error.message);
    process.exit(1);
  });
