import { execSync } from "child_process";
import { createPublicClient, createWalletClient, formatGwei, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import "dotenv/config";
import * as fs from "fs";

import TokenAuctionArtifact from "../artifacts/contracts/TokenAuction.sol/TokenAuction.json";

const DEFAULT_RESOURCE_NAME = "QR Destination URL";
const DEFAULT_RESOURCE_VALUE = "https://qrcoin.fun";

async function main() {
  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    throw new Error("BASE_SEPOLIA_RPC_URL is required");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required");
  }

  const resourceName = process.env.RESOURCE_NAME || DEFAULT_RESOURCE_NAME;
  const defaultResourceValue =
    process.env.DEFAULT_RESOURCE_VALUE || DEFAULT_RESOURCE_VALUE;

  console.log("Compiling contracts...");
  execSync("npx hardhat compile", { stdio: "inherit" });

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL),
  });

  const gasPrice = await publicClient.getGasPrice();
  console.log(`Network: baseSepolia (${baseSepolia.id})`);
  console.log(`Deployer: ${account.address}`);
  console.log(`Gas price: ${formatGwei(gasPrice)} gwei`);
  console.log(
    `Deploying TokenAuction with constructor args: [\"${resourceName}\", \"${defaultResourceValue}\"]`
  );

  const txHash = await walletClient.deployContract({
    abi: TokenAuctionArtifact.abi,
    bytecode: TokenAuctionArtifact.bytecode as `0x${string}`,
    args: [resourceName, defaultResourceValue],
  });

  console.log(`Deployment tx: ${txHash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  if (!receipt.contractAddress) {
    throw new Error("Contract address not found in receipt");
  }

  const contractAddress = receipt.contractAddress;
  console.log(`TokenAuction deployed at: ${contractAddress}`);
  console.log(`Explorer: https://sepolia.basescan.org/address/${contractAddress}`);

  const deploymentInfo = {
    contractAddress,
    txHash,
    deployedAt: new Date().toISOString(),
    network: "baseSepolia",
    chainId: baseSepolia.id,
    constructorArgs: {
      resourceName,
      defaultResourceValue,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = `${deploymentsDir}/TokenAuction-baseSepolia-${new Date()
    .toISOString()
    .replace(/:/g, "-")}.json`;
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Saved deployment file: ${filePath}`);

  if (process.env.BASESCAN_API_KEY) {
    console.log("Verifying contract on Base Sepolia...");
    const verifyCmd = `npx hardhat verify --network baseSepolia ${contractAddress} \"${resourceName}\" \"${defaultResourceValue}\"`;
    console.log(`Running: ${verifyCmd}`);
    execSync(verifyCmd, { stdio: "inherit" });
    console.log("Verification complete.");
  } else {
    console.log("Skipping verification: BASESCAN_API_KEY is not set.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
