import hre from "hardhat";
import "dotenv/config";
import * as fs from "fs";
import { formatUnits, parseUnits } from "viem";

const DEFAULT_NAME = "MoonXBT Test Token";
const DEFAULT_SYMBOL = "MXBT";
const DEFAULT_DECIMALS = 18;
const DEFAULT_INITIAL_SUPPLY = "1000000";

async function main() {
  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    throw new Error("BASE_SEPOLIA_RPC_URL is required");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required");
  }

  const tokenName = process.env.MOCK_TOKEN_NAME || DEFAULT_NAME;
  const tokenSymbol = process.env.MOCK_TOKEN_SYMBOL || DEFAULT_SYMBOL;
  const tokenDecimals = process.env.MOCK_TOKEN_DECIMALS
    ? Number(process.env.MOCK_TOKEN_DECIMALS)
    : DEFAULT_DECIMALS;
  const initialSupplyHuman =
    process.env.MOCK_TOKEN_INITIAL_SUPPLY || DEFAULT_INITIAL_SUPPLY;

  if (!Number.isInteger(tokenDecimals) || tokenDecimals < 0 || tokenDecimals > 18) {
    throw new Error("MOCK_TOKEN_DECIMALS must be an integer between 0 and 18");
  }

  const initialSupply = parseUnits(initialSupplyHuman, tokenDecimals);

  console.log("Compiling contracts...");
  await hre.run("compile");

  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Network: baseSepolia (84532)`);
  console.log(`Deployer: ${deployer.account.address}`);
  console.log(
    `Deploying MockERC20(name=${tokenName}, symbol=${tokenSymbol}, initialSupply=${initialSupplyHuman})`
  );

  const mockToken = await hre.viem.deployContract("MockERC20", [
    tokenName,
    tokenSymbol,
    initialSupply,
  ]);

  await mockToken.waitForDeployment();

  const address = mockToken.address;
  const balance = (await mockToken.read.balanceOf([
    deployer.account.address,
  ])) as bigint;

  console.log(`MockERC20 deployed at: ${address}`);
  console.log(
    `Owner minted balance: ${formatUnits(balance, tokenDecimals)} ${tokenSymbol}`
  );
  console.log(`Explorer: https://sepolia.basescan.org/address/${address}`);

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    contractAddress: address,
    deployedAt: new Date().toISOString(),
    network: "baseSepolia",
    chainId: 84532,
    token: {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      initialSupply: initialSupplyHuman,
    },
  };

  const filePath = `${deploymentsDir}/MockERC20-baseSepolia-${new Date()
    .toISOString()
    .replace(/:/g, "-")}.json`;
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Saved deployment file: ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
