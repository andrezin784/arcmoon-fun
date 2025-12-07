import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🌙 Deploying MoonFactory to Arc Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatUnits(balance, 6), "USDC\n");

  if (balance === BigInt(0)) {
    console.log("❌ Saldo zero! Pegue USDC em: https://faucet.circle.com");
    console.log("   Use o endereço:", deployer.address);
    return;
  }

  // Deploy MoonFactory
  console.log("Deploying MoonFactory...");
  const MoonFactory = await ethers.getContractFactory("MoonFactory");
  const factory = await MoonFactory.deploy();
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("\n✅ MoonFactory deployed to:", factoryAddress);
  console.log("\n🔗 View on ArcScan: https://testnet.arcscan.app/address/" + factoryAddress);
  
  // Save deployment info
  console.log("\n📝 Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  
  console.log("\n🚀 Moon.fun is ready to launch tokens on Arc Testnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

