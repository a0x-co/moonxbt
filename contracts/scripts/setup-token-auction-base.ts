import { getAddress, createPublicClient, formatGwei, http } from "viem";
import { base } from "viem/chains";
import "dotenv/config";
import hre from "hardhat";

const DEFAULT_BID_TOKEN = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
const DEFAULT_PRICE_USD_8 = 100000000n;

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

async function getWriteTxOverrides(publicClient: any) {
  const gasPrice = await publicClient.getGasPrice();

  const maxPriorityFeePerGas = gasPrice > 0n ? gasPrice : 1_000_000n;
  const maxFeePerGas = gasPrice * 2n + maxPriorityFeePerGas;

  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
}

async function waitForSuccessfulReceipt(publicClient: any, hash: `0x${string}`) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Transaction ${hash} reverted during confirmation`);
  }
  return receipt;
}

async function main() {
  const rpcUrl = requireEnv("BASE_RPC_URL");
  const contractAddress = getAddress(requireEnv("TOKEN_AUCTION_ADDRESS"));
  const bidToken = getAddress(
    process.env.INITIAL_TOKEN_ADDRESS_FOR_BID?.trim() || DEFAULT_BID_TOKEN
  );
  const bidTokenPriceUsd8 =
    getOptionalBigInt("TOKEN_PRICE_USD_8") || DEFAULT_PRICE_USD_8;
  const transferOwnershipTo =
    getOptionalAddress("TRANSFER_OWNERSHIP_TO") ||
    getOptionalAddress("MULTISIG_OWNER_ADDRESS");

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

  const [ownerWalletClient] = await hre.viem.getWalletClients();
  const tokenAuction = await hre.viem.getContractAt(
    "TokenAuction",
    contractAddress
  );

  console.log(`Contract: ${contractAddress}`);
  console.log(`Network: base (${chainId})`);
  console.log(`Owner wallet: ${ownerWalletClient.account.address}`);
  console.log(`Current gas price: ${formatGwei(await publicClient.getGasPrice())} gwei`);

  const currentOwner = (await tokenAuction.read.owner()) as `0x${string}`;
  console.log(`Current owner: ${currentOwner}`);

  const isAllowed = (await tokenAuction.read.allowedTokens([bidToken])) as boolean;
  console.log(`Bid token allowed: ${isAllowed}`);

  if (!isAllowed) {
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.addAllowedToken([bidToken], {
      account: ownerWalletClient.account,
      ...overrides,
    });
    await waitForSuccessfulReceipt(publicClient, txHash);
    console.log("Allowed token configured.");
  }

  const currentPrice = (await tokenAuction.read.tokenPrices([bidToken])) as bigint;
  console.log(`Current token price (8 decimals): ${currentPrice.toString()}`);

  if (currentPrice !== bidTokenPriceUsd8) {
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.setTokenPrice(
      [bidToken, bidTokenPriceUsd8],
      {
        account: ownerWalletClient.account,
        ...overrides,
      }
    );
    await waitForSuccessfulReceipt(publicClient, txHash);
    console.log("Bid token price configured.");
  }

  if (
    transferOwnershipTo &&
    currentOwner.toLowerCase() !== transferOwnershipTo.toLowerCase()
  ) {
    console.log(`Transferring ownership to ${transferOwnershipTo}...`);
    const overrides = await getWriteTxOverrides(publicClient);
    const txHash = await tokenAuction.write.transferOwnership(
      [transferOwnershipTo],
      {
        account: ownerWalletClient.account,
        ...overrides,
      }
    );
    await waitForSuccessfulReceipt(publicClient, txHash);
    console.log("Ownership transfer completed.");
  } else if (transferOwnershipTo) {
    console.log("Ownership already points to target multisig.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
