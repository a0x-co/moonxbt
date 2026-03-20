import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import "dotenv/config";
import * as fs from "fs";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const DEFAULT_PRICE_USD_8 = 100000000n; // 1.00 USD with 8 decimals

const tokenAuctionAbi = [
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "allowedTokens",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
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
    inputs: [{ internalType: "address", name: "token", type: "address" }],
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
] as const;

function findLatestSepoliaDeployment(): string | null {
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) return null;

  const files = fs
    .readdirSync(deploymentsDir)
    .filter((f) => f.startsWith("TokenAuction-baseSepolia-") && f.endsWith(".json"))
    .sort();

  if (files.length === 0) return null;

  const latest = files[files.length - 1];
  const content = JSON.parse(
    fs.readFileSync(`${deploymentsDir}/${latest}`, "utf-8")
  ) as { contractAddress?: string };

  return content.contractAddress || null;
}

async function main() {
  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    throw new Error("BASE_SEPOLIA_RPC_URL is required");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required");
  }

  const contractAddressEnv = process.env.TOKEN_AUCTION_ADDRESS;
  const contractAddressResolved =
    contractAddressEnv || findLatestSepoliaDeployment();

  if (!contractAddressResolved) {
    throw new Error(
      "TOKEN_AUCTION_ADDRESS not set and no TokenAuction-baseSepolia deployment file found"
    );
  }

  const contractAddress = getAddress(contractAddressResolved);
  const tokenAddress = getAddress(
    process.env.INITIAL_TOKEN_ADDRESS_FOR_BID || USDC_BASE_SEPOLIA
  );
  const tokenPriceUsd8 = process.env.TOKEN_PRICE_USD_8
    ? BigInt(process.env.TOKEN_PRICE_USD_8)
    : DEFAULT_PRICE_USD_8;

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

  console.log(`Network: baseSepolia (${baseSepolia.id})`);
  console.log(`Owner wallet: ${account.address}`);
  console.log(`TokenAuction: ${contractAddress}`);
  console.log(`Bid token: ${tokenAddress}`);
  console.log(`Token price in USD (8d): ${tokenPriceUsd8.toString()}`);

  const isAllowed = (await publicClient.readContract({
    address: contractAddress,
    abi: tokenAuctionAbi,
    functionName: "allowedTokens",
    args: [tokenAddress],
  })) as boolean;

  if (!isAllowed) {
    console.log("Calling addAllowedToken...");
    const tx = await walletClient.writeContract({
      address: contractAddress,
      abi: tokenAuctionAbi,
      functionName: "addAllowedToken",
      args: [tokenAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("addAllowedToken complete.");
  } else {
    console.log("Token already allowed.");
  }

  const currentPrice = (await publicClient.readContract({
    address: contractAddress,
    abi: tokenAuctionAbi,
    functionName: "tokenPrices",
    args: [tokenAddress],
  })) as bigint;

  if (currentPrice !== tokenPriceUsd8) {
    console.log(`Calling setTokenPrice (current=${currentPrice}, target=${tokenPriceUsd8})...`);
    const tx = await walletClient.writeContract({
      address: contractAddress,
      abi: tokenAuctionAbi,
      functionName: "setTokenPrice",
      args: [tokenAddress, tokenPriceUsd8],
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("setTokenPrice complete.");
  } else {
    console.log("Token price already set to target value.");
  }

  console.log("Sepolia setup completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
