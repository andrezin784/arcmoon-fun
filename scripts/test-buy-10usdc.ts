import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { MOON_TOKEN_ABI, MOON_FACTORY_ABI } from '../lib/contracts';

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

  // Setup clients
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network'),
  });

  const FACTORY_ADDRESS = '0x8731E90f8b4128018Bfff2d0EB14B27Fb108B9Bc' as `0x${string}`;

  console.log("Factory:", FACTORY_ADDRESS);

  // Get recent token
  const tokens = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: MOON_FACTORY_ABI,
    functionName: 'getRecentTokens',
    args: [1n],
  }) as `0x${string}`[];

  if (tokens.length === 0) {
    console.log("❌ No tokens found. Create one first!");
    return;
  }

  const tokenAddress = tokens[0];
  console.log("Token:", tokenAddress, "\n");

  // Get token info
  const tokenInfo = await publicClient.readContract({
    address: tokenAddress,
    abi: MOON_TOKEN_ABI,
    functionName: 'getTokenInfo',
  }) as any[];

  console.log("Token Name:", tokenInfo[0]);
  console.log("Token Symbol:", tokenInfo[1]);
  console.log("Current Price:", formatUnits(tokenInfo[7], 6), "USDC\n");

  // TEST: 10 USDC
  const amountUSDC = parseUnits("10", 6);
  console.log("--- TEST INPUT ---");
  console.log("Input String: '10'");
  console.log("ParseUnits(10, 6):", amountUSDC.toString(), "units");
  console.log("Expected: 10000000 units");
  console.log("Match:", amountUSDC.toString() === "10000000" ? "✅" : "❌");
  console.log("In USDC:", formatUnits(amountUSDC, 6), "USDC\n");

  // Calculate tokens out
  const tokensOut = await publicClient.readContract({
    address: tokenAddress,
    abi: MOON_TOKEN_ABI,
    functionName: 'calculateTokensForPayment',
    args: [amountUSDC],
  }) as bigint;

  console.log("--- BONDING CURVE CALC ---");
  console.log("Tokens Out:", formatUnits(tokensOut, 18));
  console.log("Min Tokens (1% slippage):", formatUnits((tokensOut * 99n) / 100n, 18), "\n");

  // Simulate transaction (if private key available)
  if (process.env.PRIVATE_KEY) {
    try {
      const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http('https://rpc.testnet.arc.network'),
      });

      console.log("--- SIMULATE TRANSACTION ---");
      const minTokens = (tokensOut * 99n) / 100n;

      const { request } = await publicClient.simulateContract({
        account: account.address,
        address: tokenAddress,
        abi: MOON_TOKEN_ABI,
        functionName: 'buy',
        args: [minTokens],
        value: amountUSDC, // THIS IS THE KEY: value in native currency (USDC 6 decimals)
      });

      console.log("✅ Simulation SUCCESS!");
      console.log("Value to send:", formatUnits(amountUSDC, 6), "USDC");
      console.log("Value (raw):", amountUSDC.toString(), "units");
      console.log("Expected tokens:", formatUnits(tokensOut, 18));
      console.log("\nReady to execute with writeContract!");

    } catch (error: any) {
      console.log("❌ Simulation FAILED:", error.message);
    }
  } else {
    console.log("ℹ️ Set PRIVATE_KEY env var to test simulation");
  }

  console.log("\n=== TEST COMPLETE ===");
  console.log("If simulation passed, frontend should send:");
  console.log(`  value: ${amountUSDC.toString()}n (${formatUnits(amountUSDC, 6)} USDC)`);
}

testBuy10USDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
