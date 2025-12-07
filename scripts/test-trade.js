const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance (Wei/Smallest Unit):", balance.toString());

  // 1. Deploy Factory
  console.log("Deploying Factory...");
  const MoonFactory = await hre.ethers.getContractFactory("MoonFactory");
  const factory = await MoonFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("Factory deployed to:", factoryAddress);

  // 2. Create Token
  console.log("Creating Token...");
  const tx = await factory.createToken("TestToken", "TEST", "Testing Trade", "local://test");
  const receipt = await tx.wait();
  
  // Parse event to get token address
  // Event TokenCreated(address indexed tokenAddress, ...)
  // In ethers v6, we look at logs.
  let tokenAddress;
  for (const log of receipt.logs) {
    try {
        const parsed = factory.interface.parseLog(log);
        if (parsed.name === 'TokenCreated') {
            tokenAddress = parsed.args[0];
            break;
        }
    } catch (e) {}
  }
  
  if (!tokenAddress) {
    console.error("Token creation failed or event not found");
    return;
  }
  console.log("Token created at:", tokenAddress);

  // 3. Connect to Token
  const MoonToken = await hre.ethers.getContractFactory("MoonToken");
  const token = MoonToken.attach(tokenAddress);

  // 4. Test Buy
  // 1 USDC = 1,000,000 (6 decimals)
  const buyAmount = 100000n; // 0.1 USDC
  console.log(`Buying with ${buyAmount} units (0.1 USDC)...`);
  
  try {
      const txBuy = await token.buy(0, { value: buyAmount });
      await txBuy.wait();
      console.log("✅ Buy Successful!");
      
      const info = await token.getTokenInfo();
      console.log("Price after buy:", info[7].toString()); // info[7] is currentPrice
      console.log("Total Sold:", info[6].toString());
      console.log("Reserve:", info[8].toString());

  } catch (e) {
      console.error("❌ Buy Failed:", e.message);
  }

  // 5. Test Sell
  console.log("Testing Sell...");
  const sellAmount = await token.balanceOf(deployer.address);
  console.log("Token Balance:", sellAmount.toString());
  
  if (sellAmount > 0n) {
      // Sell half
      const toSell = sellAmount / 2n;
      console.log(`Selling ${toSell.toString()} tokens...`);
      try {
          // No approve needed for internal transfer if logic is correct
          const txSell = await token.sell(toSell, 0);
          await txSell.wait();
          console.log("✅ Sell Successful!");
          
          const infoAfter = await token.getTokenInfo();
          console.log("Price after sell:", infoAfter[7].toString());
          console.log("Reserve after sell:", infoAfter[8].toString());
      } catch (e) {
          console.error("❌ Sell Failed:", e.message);
      }
  } else {
      console.log("No tokens to sell");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

