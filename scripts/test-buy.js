const hre = require("hardhat");
const { parseUnits, formatUnits } = require("viem");

async function main() {
  console.log("=== TEST BUY SIMULATION (Arc Testnet) ===\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("USDC Balance:", formatUnits(balance, 6), "USDC\n");

  // Factory address (update this)
  const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0xF4ed1C49CdddEC03a5011bcD14ACCDC88bEd4bE5";
  console.log("Factory Address:", FACTORY_ADDRESS);

  const MoonFactory = await hre.ethers.getContractFactory("MoonFactory");
  const factory = MoonFactory.attach(FACTORY_ADDRESS);

  // Get recent tokens
  const tokens = await factory.getRecentTokens(1);
  if (tokens.length === 0) {
    console.log("❌ No tokens found. Create a token first!");
    return;
  }

  const tokenAddress = tokens[0];
  console.log("Testing with token:", tokenAddress, "\n");

  // Attach to token
  const MoonToken = await hre.ethers.getContractFactory("MoonToken");
  const token = MoonToken.attach(tokenAddress);

  // Get token info
  const info = await token.getTokenInfo();
  console.log("Token Info:");
  console.log("  Name:", info[0]);
  console.log("  Symbol:", info[1]);
  console.log("  Current Price:", formatUnits(info[7], 6), "USDC per token");
  console.log("  Total Sold:", formatUnits(info[6], 18), "tokens\n");

  // Test amounts
  const testAmounts = [
    { usdc: "0.001", label: "Minimum (0.001 USDC)" },
    { usdc: "1", label: "Small (1 USDC)" },
    { usdc: "10", label: "Medium (10 USDC)" },
  ];

  for (const test of testAmounts) {
    console.log(`--- Test: ${test.label} ---`);
    
    const amountUSDC = parseUnits(test.usdc, 6);
    console.log("  Amount (units):", amountUSDC.toString());
    console.log("  Amount (USDC):", formatUnits(amountUSDC, 6));

    try {
      // Calculate tokens to receive
      const tokensOut = await token.calculateTokensForPayment(amountUSDC);
      console.log("  Tokens Out:", formatUnits(tokensOut, 18));

      // Calculate min tokens (1% slippage)
      const minTokens = (tokensOut * 99n) / 100n;
      console.log("  Min Tokens (1% slippage):", formatUnits(minTokens, 18));

      // Check if we have enough balance
      if (balance < amountUSDC) {
        console.log("  ❌ Insufficient balance for this test");
      } else {
        console.log("  ✅ Valid transaction (not executing)");
      }
    } catch (error) {
      console.log("  ❌ Error:", error.message);
    }
    console.log("");
  }

  console.log("=== Test complete (no transactions sent) ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
