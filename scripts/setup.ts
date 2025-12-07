import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🌙 ====================================");
  console.log("   Moon.fun - Setup Automático");
  console.log("====================================\n");

  // Verificar se já existe uma wallet configurada
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = "";
  
  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch {
    envContent = "";
  }

  // Verificar private key
  const privateKeyMatch = envContent.match(/PRIVATE_KEY=([^\n]*)/);
  let privateKey = privateKeyMatch ? privateKeyMatch[1].trim() : "";

  if (!privateKey) {
    console.log("⚠️  Nenhuma private key configurada!");
    console.log("\n📝 Para configurar, siga os passos:\n");
    console.log("1. Crie uma nova wallet no MetaMask (apenas para teste!)");
    console.log("2. Exporte a private key da wallet");
    console.log("3. Acesse https://faucet.circle.com e pegue USDC");
    console.log("4. Edite o arquivo .env.local e adicione sua private key:");
    console.log("\n   PRIVATE_KEY=sua_private_key_aqui\n");
    console.log("5. Execute novamente: npx hardhat run scripts/setup.ts --network arcTestnet\n");
    return;
  }

  console.log("✅ Private key encontrada!\n");

  // Verificar saldo
  const [deployer] = await ethers.getSigners();
  console.log("📍 Endereço da wallet:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceFormatted = ethers.formatUnits(balance, 6); // USDC tem 6 decimais
  console.log("💰 Saldo USDC:", balanceFormatted, "USDC\n");

  if (balance < ethers.parseUnits("0.1", 6)) {
    console.log("⚠️  Saldo muito baixo para deploy!");
    console.log("\n📝 Pegue USDC grátis em: https://faucet.circle.com");
    console.log("   Use o endereço:", deployer.address);
    console.log("\n   Depois execute novamente este script.\n");
    return;
  }

  // Verificar se factory já foi deployada
  const factoryMatch = envContent.match(/NEXT_PUBLIC_FACTORY_ADDRESS=([^\n]*)/);
  const existingFactory = factoryMatch ? factoryMatch[1].trim() : "";

  if (existingFactory && existingFactory !== "" && existingFactory !== "0x0000000000000000000000000000000000000000") {
    console.log("✅ Factory já deployada em:", existingFactory);
    console.log("\n🎉 Setup completo! Execute: npm run dev\n");
    return;
  }

  // Deploy da Factory
  console.log("🚀 Iniciando deploy da MoonFactory...\n");

  try {
    const MoonFactory = await ethers.getContractFactory("MoonFactory");
    const factory = await MoonFactory.deploy();
    
    console.log("⏳ Aguardando confirmação...");
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("\n✅ MoonFactory deployada em:", factoryAddress);
    console.log("🔗 Ver no ArcScan: https://testnet.arcscan.app/address/" + factoryAddress);

    // Atualizar .env.local
    let newEnvContent = envContent.replace(
      /NEXT_PUBLIC_FACTORY_ADDRESS=.*/,
      `NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`
    );

    if (!newEnvContent.includes("NEXT_PUBLIC_FACTORY_ADDRESS")) {
      newEnvContent += `\nNEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`;
    }

    fs.writeFileSync(envPath, newEnvContent);
    console.log("\n✅ Arquivo .env.local atualizado automaticamente!");

    console.log("\n🎉 ====================================");
    console.log("   Setup Completo!");
    console.log("====================================\n");
    console.log("Execute agora: npm run dev");
    console.log("Acesse: http://localhost:3000\n");

  } catch (error: any) {
    console.error("\n❌ Erro no deploy:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Pegue mais USDC em: https://faucet.circle.com");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

