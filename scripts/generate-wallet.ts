import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🌙 ====================================");
  console.log("   Moon.fun - Gerador de Wallet");
  console.log("====================================\n");

  // Gerar nova wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ Nova wallet gerada!\n");
  console.log("📍 Endereço:", wallet.address);
  console.log("🔑 Private Key:", wallet.privateKey.slice(2)); // Remove 0x
  console.log("\n⚠️  IMPORTANTE:");
  console.log("   - Guarde a private key em local seguro");
  console.log("   - Use esta wallet APENAS para testes");
  console.log("   - NUNCA use com fundos reais!\n");

  // Atualizar .env.local
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = "";
  
  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch {
    envContent = `# Moon.fun Configuration
PRIVATE_KEY=
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_WALLET_CONNECT_ID=moon-fun-arc`;
  }

  // Atualizar private key
  if (envContent.includes("PRIVATE_KEY=")) {
    envContent = envContent.replace(
      /PRIVATE_KEY=.*/,
      `PRIVATE_KEY=${wallet.privateKey.slice(2)}`
    );
  } else {
    envContent = `PRIVATE_KEY=${wallet.privateKey.slice(2)}\n` + envContent;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Private key salva em .env.local\n");

  console.log("📝 Próximos passos:");
  console.log("   1. Acesse: https://faucet.circle.com");
  console.log("   2. Cole o endereço:", wallet.address);
  console.log("   3. Pegue USDC grátis para a Arc Testnet");
  console.log("   4. Execute: npx hardhat run scripts/setup.ts --network arcTestnet\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

