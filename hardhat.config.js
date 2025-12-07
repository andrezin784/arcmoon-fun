require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");
const path = require("path");

// Carregar .env.local primeiro
const envLocalPath = path.resolve(__dirname, ".env.local");
const envPath = path.resolve(__dirname, ".env");

if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

