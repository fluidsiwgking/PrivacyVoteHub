import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: { deployer: 0 },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: { auto: true, interval: 1000 },
    },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545",
      mining: { auto: true, interval: 1000 },
    },
    sepolia: {
      chainId: 11155111,
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: { enabled: true, runs: 800 },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    deploy: "./deploy",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;


