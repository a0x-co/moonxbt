import { execSync } from "child_process";
import * as fs from "fs";

import { getAddress, createPublicClient, formatGwei, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";
import { ethers } from "ethers";
import hre from "hardhat";

const DEFAULT_BID_TOKEN = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
const DEFAULT_RESOURCE_NAME = "Video Prompt URL";
const DEFAULT_RESOURCE_VALUE = "https://www.moonxbt.fun/moonxbt/video";
const DEFAULT_PRICE_USD_8 = 100000000n; // 1.00 USD with 8 decimals

const tokenAuctionAdminAbi = [
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "allowedTokens",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenPrices",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "addAllowedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "priceInUSD", type: "uint256" },
    ],
    name: "setTokenPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

function getOptionalAddress(name: string): `0x${string}` | undefined {
  const value = process.env[name]?.trim();
  return value ? getAddress(value) : undefined;
}

function getOptionalBigInt(name: string): bigint | undefined {
  const value = process.env[name]?.trim();
  return value ? BigInt(value) : undefined;
}

function toBool(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

async function getWriteTxOverrides(publicClient: any) {
  const gasPrice = await publicClient.getGasPrice();

  const maxPriorityFeePerGas = gasPrice > 0n ? gasPrice : 1_000_000n;
  const maxFeePerGas = gasPrice * 2n + maxPriorityFeePerGas;

  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
}

async function waitForDeployedCode(
  publicClient: any,
  contractAddress: `0x${string}`,
  options?: { attempts?: number; delayMs?: number }
) {
  const attempts = options?.attempts ?? 20;
  const delayMs = options?.delayMs ?? 3000;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const bytecode = await publicClient.getBytecode({
      address: contractAddress,
    });

    if (bytecode && bytecode !== "0x") {
      return;
    }

    console.log(
      `Waiting for on-chain bytecode at ${contractAddress} (${attempt}/${attempts})...`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Contract bytecode not found at ${contractAddress} after waiting for propagation`
  );
}

async function waitForSuccessfulReceipt(publicClient: any, hash: `0x${string}`) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Transaction ${hash} reverted during confirmation`);
  }
  return receipt;
}

async function waitForAllowedToken(
  tokenAuction: any,
  token: `0x${string}`,
  options?: { attempts?: number; delayMs?: number }
) {
  const attempts = options?.attempts ?? 10;
  const delayMs = options?.delayMs ?? 1500;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const isAllowed = (await tokenAuction.read.allowedTokens([token])) as boolean;
    if (isAllowed) {
      return;
    }

    console.log(
      `Waiting for allowed token state to propagate (${attempt}/${attempts})...`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Token ${token} was not marked as allowed after update`);
}

async function configureContract(options: {
  tokenAuction: any;
  ownerAccount: any;
  publicClient: any;
  contractAddress: `0x${string}`;
  bidToken: `0x${string}`;
  bidTokenPriceUsd8: bigint;
  transferOwnershipTo?: `0x${string}`;
}) {
  const { tokenAuction, ownerAccount, publicClient } = options;
  const currentOwner = (await tokenAuction.read.owner()) as `0x${string}`;

  if (currentOwner.toLowerCase() !== ownerAccount.address.toLowerCase()) {
    throw new Error(
      `Config wallet ${ownerAccount.address} is not the owner. Current owner: ${currentOwner}`
    );
  }

  const isAllowed = (await tokenAuction.read.allowedTokens([
    options.bidToken,
  ])) as boolean;

  if (!isAllowed) {
    console.log(`Adding allowed bid token ${options.bidToken}...`);
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.addAllowedToken([options.bidToken], {
      account: ownerAccount,
      ...overrides,
    });
    await waitForSuccessfulReceipt(publicClient, txHash);
    await waitForAllowedToken(tokenAuction, options.bidToken);
    console.log("Allowed token configured.");
  } else {
    console.log("Bid token already allowed.");
  }

  const currentPrice = (await tokenAuction.read.tokenPrices([
    options.bidToken,
  ])) as bigint;

  if (currentPrice !== options.bidTokenPriceUsd8) {
    console.log(
      `Setting token price to ${options.bidTokenPriceUsd8.toString()} (8 decimals)...`
    );
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.setTokenPrice(
      [options.bidToken, options.bidTokenPriceUsd8],
      {
        account: ownerAccount,
        ...overrides,
      }
    );
    await waitForSuccessfulReceipt(publicClient, txHash);
    console.log("Bid token price configured.");
  } else {
    console.log("Bid token price already configured.");
  }

  if (
    options.transferOwnershipTo &&
    currentOwner.toLowerCase() !== options.transferOwnershipTo.toLowerCase()
  ) {
    console.log(`Transferring ownership to ${options.transferOwnershipTo}...`);
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.transferOwnership(
      [options.transferOwnershipTo],
      {
        account: ownerAccount,
        ...overrides,
      }
    );
    await waitForSuccessfulReceipt(publicClient, txHash);
    const updatedOwner = (await tokenAuction.read.owner()) as `0x${string}`;
    if (updatedOwner.toLowerCase() !== options.transferOwnershipTo.toLowerCase()) {
      throw new Error(
        `Ownership transfer verification failed. Expected ${options.transferOwnershipTo}, got ${updatedOwner}`
      );
    }
    console.log("Ownership transferred.");
  } else if (options.transferOwnershipTo) {
    console.log("Ownership already points to target multisig.");
  }
}

async function verifyContract(
  contractAddress: `0x${string}`,
  constructorArgs: [string, string]
) {
  if (!process.env.BASESCAN_API_KEY) {
    console.warn(
      "BASESCAN_API_KEY is not set. Skipping automatic verification."
    );
    return;
  }

  console.log("Waiting 30 seconds before verification for Basescan indexing...");
  await new Promise((resolve) => setTimeout(resolve, 30000));

  const verifyArgsPath = "scripts/verify-args.js";
  try {
    fs.writeFileSync(
      verifyArgsPath,
      `module.exports = ${JSON.stringify(constructorArgs, null, 2)};\n`
    );

    const command = `npx hardhat verify --network base --constructor-args ${verifyArgsPath} ${contractAddress}`;
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit" });
    console.log("Verification completed successfully.");
  } catch (error) {
    const abiCoder = new ethers.AbiCoder();
    const encodedArgs = abiCoder.encode(
      ["string", "string"],
      constructorArgs
    );

    console.error("Automatic verification failed.", error);
    console.log("Manual verification details:");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Resource name: ${constructorArgs[0]}`);
    console.log(`Default value: ${constructorArgs[1]}`);
    console.log(`Encoded args: ${encodedArgs.slice(2)}`);
  } finally {
    if (fs.existsSync(verifyArgsPath)) {
      fs.unlinkSync(verifyArgsPath);
    }
  }
}

async function main() {
  console.log("Starting TokenAuction mainnet deployment...");

  const rpcUrl = requireEnv("BASE_RPC_URL");
  const ownerPrivateKey = requireEnv("PRIVATE_KEY") as `0x${string}`;
  const deployer = privateKeyToAccount(ownerPrivateKey);

  const resourceName =
    process.env.RESOURCE_NAME?.trim() || DEFAULT_RESOURCE_NAME;
  const defaultResourceValue =
    process.env.DEFAULT_RESOURCE_VALUE?.trim() || DEFAULT_RESOURCE_VALUE;
  const bidToken = getAddress(
    process.env.INITIAL_TOKEN_ADDRESS_FOR_BID?.trim() || DEFAULT_BID_TOKEN
  );
  const bidTokenPriceUsd8 =
    getOptionalBigInt("TOKEN_PRICE_USD_8") || DEFAULT_PRICE_USD_8;
  const transferOwnershipTo =
    getOptionalAddress("TRANSFER_OWNERSHIP_TO") ||
    getOptionalAddress("MULTISIG_OWNER_ADDRESS");
  const writeGeneratedEnv = toBool(
    process.env.WRITE_GENERATED_ENV_FILE,
    true
  );

  console.log("\nCompiling contract...");
  await hre.run("compile");
  console.log("Compilation finished.");
  const [ownerWalletClient] = await hre.viem.getWalletClients();
  const hardhatPublicClient = await hre.viem.getPublicClient();

  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
  const chainId = await publicClient.getChainId();
  if (chainId !== base.id) {
    throw new Error(
      `Wrong network detected. Expected Base mainnet (${base.id}), got chainId ${chainId}`
    );
  }

  console.log(`Deploying from account: ${deployer.address}`);
  console.log(`Network: base (${chainId})`);
  console.log(`Resource name: ${resourceName}`);
  console.log(`Default resource value: ${defaultResourceValue}`);
  console.log(`Bid token: ${bidToken}`);
  console.log(`Bid token price (8 decimals): ${bidTokenPriceUsd8.toString()}`);
  if (transferOwnershipTo) {
    console.log(`Ownership transfer target: ${transferOwnershipTo}`);
  }

  try {
    const gasPrice = await publicClient.getGasPrice();
    console.log(`Current gas price: ${formatGwei(gasPrice)} gwei`);
  } catch (error) {
    console.warn(`Could not fetch gas price: ${(error as Error).message}`);
  }

  console.log("\nDeploying TokenAuction...");
  // @ts-ignore Hardhat viem typing is incomplete here.
  const tokenAuction: any = await hre.viem.deployContract("TokenAuction", [
    resourceName,
    defaultResourceValue,
  ]);

  const deploymentTxHash = tokenAuction.deploymentTransaction?.hash;
  if (deploymentTxHash) {
    console.log(`Deployment transaction: ${deploymentTxHash}`);
    console.log("Waiting for deployment confirmation...");
    await publicClient.waitForTransactionReceipt({ hash: deploymentTxHash });
  }
  const contractAddress = getAddress(tokenAuction.address);

  console.log(`Contract deployed to: ${contractAddress}`);
  console.log(`Basescan: https://basescan.org/address/${contractAddress}`);

  await waitForDeployedCode(publicClient, contractAddress);
  await waitForDeployedCode(hardhatPublicClient, contractAddress, {
    attempts: 5,
    delayMs: 1000,
  });

  const deployedTokenAuction = await hre.viem.getContractAt(
    "TokenAuction",
    contractAddress
  );

  await configureContract({
    tokenAuction: deployedTokenAuction,
    ownerAccount: ownerWalletClient.account,
    publicClient: hardhatPublicClient,
    contractAddress,
    bidToken,
    bidTokenPriceUsd8,
    transferOwnershipTo,
  });

  await verifyContract(contractAddress, [resourceName, defaultResourceValue]);

  const finalOwner = transferOwnershipTo || deployer.address;
  const deploymentSummary = {
    network: "base-mainnet",
    chainId: 8453,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    owner: finalOwner,
    deploymentTxHash: deploymentTxHash || null,
    tokenAuction: {
      address: contractAddress,
      constructorArgs: {
        resourceName,
        defaultResourceValue,
      },
    },
    bidToken: {
      address: bidToken,
      priceUsd8: bidTokenPriceUsd8.toString(),
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = `${deploymentsDir}/TokenAuction-mainnet-${new Date()
    .toISOString()
    .replace(/:/g, "-")}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Expected deployment summary file was not created: ${deploymentFile}`);
  }
  console.log(`Deployment summary file created: ${deploymentFile}`);

  if (writeGeneratedEnv) {
    const generatedEnv = [
      `# Generated by deploy-token-auction.ts at ${new Date().toISOString()}`,
      `TOKEN_AUCTION_ADDRESS=${contractAddress}`,
      `INITIAL_TOKEN_ADDRESS_FOR_BID=${bidToken}`,
      `TOKEN_PRICE_USD_8=${bidTokenPriceUsd8.toString()}`,
      `TRANSFER_OWNERSHIP_TO=${finalOwner}`,
      `NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=${contractAddress}`,
      `NEXT_PUBLIC_BID_TOKEN_CONTRACT_ADDRESS=${bidToken}`,
      `NEXT_PUBLIC_BID_TOKEN_SYMBOL=USDC`,
      `NEXT_PUBLIC_BID_TOKEN_DECIMALS=6`,
    ].join("\n");

    const generatedEnvFile = `${deploymentsDir}/base-mainnet.generated.env`;
    fs.writeFileSync(generatedEnvFile, `${generatedEnv}\n`);
    if (!fs.existsSync(generatedEnvFile)) {
      throw new Error(`Expected generated env file was not created: ${generatedEnvFile}`);
    }
    console.log(`Generated env file: ${generatedEnvFile}`);
  }

  console.log("\nDeployment completed.");
  console.log(`MOONXBT_AUCTION_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_BID_TOKEN_CONTRACT_ADDRESS=${bidToken}`);
  console.log(`Final owner: ${finalOwner}`);
  console.log(`Deployment summary: ${deploymentFile}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
