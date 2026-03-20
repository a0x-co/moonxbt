import { execSync } from "child_process";
import { getAddress, parseUnits } from "viem";
import hre from "hardhat";
import "dotenv/config";
import * as fs from "fs";

const DEFAULT_RESOURCE_NAME = "QR Destination URL";
const DEFAULT_RESOURCE_VALUE = "https://qrcoin.fun";
const DEFAULT_TOKEN_NAME = "MoonXBT Test Token";
const DEFAULT_TOKEN_SYMBOL = "MXBT";
const DEFAULT_TOKEN_DECIMALS = 18;
const DEFAULT_INITIAL_SUPPLY = "1000000";
const DEFAULT_MINT_AMOUNT = "50000";
const DEFAULT_TOKEN_PRICE_USD_8 = "100000000";

function envRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function toBool(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

async function main() {
  envRequired("BASE_SEPOLIA_RPC_URL");
  envRequired("PRIVATE_KEY");

  const resourceName = process.env.RESOURCE_NAME || DEFAULT_RESOURCE_NAME;
  const defaultResourceValue =
    process.env.DEFAULT_RESOURCE_VALUE || DEFAULT_RESOURCE_VALUE;

  const tokenName = process.env.MOCK_TOKEN_NAME || DEFAULT_TOKEN_NAME;
  const tokenSymbol = process.env.MOCK_TOKEN_SYMBOL || DEFAULT_TOKEN_SYMBOL;
  const tokenDecimals = process.env.MOCK_TOKEN_DECIMALS
    ? Number(process.env.MOCK_TOKEN_DECIMALS)
    : DEFAULT_TOKEN_DECIMALS;

  if (!Number.isInteger(tokenDecimals) || tokenDecimals < 0 || tokenDecimals > 18) {
    throw new Error("MOCK_TOKEN_DECIMALS must be an integer between 0 and 18");
  }

  const initialSupplyHuman =
    process.env.MOCK_TOKEN_INITIAL_SUPPLY || DEFAULT_INITIAL_SUPPLY;
  const mintAmountHuman = process.env.MINT_AMOUNT || DEFAULT_MINT_AMOUNT;
  const tokenPriceUsd8 = BigInt(
    process.env.TOKEN_PRICE_USD_8 || DEFAULT_TOKEN_PRICE_USD_8
  );

  const autoVerify = toBool(process.env.AUTO_VERIFY, false);
  const writeGeneratedEnv = toBool(process.env.WRITE_GENERATED_ENV_FILE, true);

  console.log("Compiling contracts...");
  await hre.run("compile");

  const [owner] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();
  const ownerAddress = getAddress(owner.account.address);
  const mintTo = getAddress(process.env.MINT_TO || ownerAddress);

  console.log(`Network chainId: ${(await publicClient.getChainId()).toString()}`);
  console.log(`Owner wallet: ${ownerAddress}`);

  const tokenAuction: any = await hre.viem.deployContract("TokenAuction", [
    resourceName,
    defaultResourceValue,
  ]);
  const auctionAddress = getAddress(tokenAuction.address);
  console.log(`TokenAuction deployed: ${auctionAddress}`);

  // Wait for mempool to settle before next deployment
  console.log("Waiting before MockERC20 deployment...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const initialSupply = parseUnits(initialSupplyHuman, tokenDecimals);
  const mockToken: any = await hre.viem.deployContract("MockERC20", [
    tokenName,
    tokenSymbol,
    initialSupply,
  ]);
  const mockTokenAddress = getAddress(mockToken.address);
  console.log(`MockERC20 deployed: ${mockTokenAddress}`);

  const mintAmount = parseUnits(mintAmountHuman, tokenDecimals);
  if (mintAmount > 0n) {
    // Wait for mempool to settle before mint
    console.log("Waiting before mint...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Get current gas price and add buffer
    const gasPrice = await publicClient.getGasPrice();
    const maxFeePerGas = gasPrice * 2n; // 2x buffer
    const maxPriorityFeePerGas = parseUnits("2", "gwei"); // 2 gwei priority fee
    
    const mintTx = await mockToken.write.mint([mintTo, mintAmount], {
      account: owner.account,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    console.log(`Minted ${mintAmountHuman} ${tokenSymbol} to ${mintTo}`);
  }

  const isAllowed = (await tokenAuction.read.allowedTokens([
    mockTokenAddress,
  ])) as boolean;
  if (!isAllowed) {
    // Wait for mempool to settle before addAllowedToken
    console.log("Waiting before addAllowedToken...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const gasPrice = await publicClient.getGasPrice();
    const maxFeePerGas = gasPrice * 2n;
    const maxPriorityFeePerGas = parseUnits("2", "gwei");
    
    const allowTx = await tokenAuction.write.addAllowedToken([mockTokenAddress], {
      account: owner.account,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    await publicClient.waitForTransactionReceipt({ hash: allowTx });
    console.log("addAllowedToken complete");
  }

  const currentPrice = (await tokenAuction.read.tokenPrices([
    mockTokenAddress,
  ])) as bigint;
  if (currentPrice !== tokenPriceUsd8) {
    // Wait for mempool to settle before setTokenPrice
    console.log("Waiting before setTokenPrice...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const gasPrice = await publicClient.getGasPrice();
    const maxFeePerGas = gasPrice * 2n;
    const maxPriorityFeePerGas = parseUnits("2", "gwei");
    
    const priceTx = await tokenAuction.write.setTokenPrice(
      [mockTokenAddress, tokenPriceUsd8],
      { account: owner.account, maxFeePerGas, maxPriorityFeePerGas }
    );
    await publicClient.waitForTransactionReceipt({ hash: priceTx });
    console.log(`setTokenPrice complete (${tokenPriceUsd8.toString()})`);
  }

  const deploymentSummary = {
    network: "baseSepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    owner: ownerAddress,
    tokenAuction: {
      address: auctionAddress,
      constructorArgs: {
        resourceName,
        defaultResourceValue,
      },
    },
    bidToken: {
      address: mockTokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      initialSupply: initialSupplyHuman,
      mintedTo: mintTo,
      mintedAmount: mintAmountHuman,
      priceUsd8: tokenPriceUsd8.toString(),
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = `${deploymentsDir}/Bootstrap-baseSepolia-${new Date()
    .toISOString()
    .replace(/:/g, "-")}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));

  if (writeGeneratedEnv) {
    const generatedEnv = [
      `# Generated by bootstrap-base-sepolia.ts at ${new Date().toISOString()}`,
      `TOKEN_AUCTION_ADDRESS=${auctionAddress}`,
      `MOCK_TOKEN_ADDRESS=${mockTokenAddress}`,
      `INITIAL_TOKEN_ADDRESS_FOR_BID=${mockTokenAddress}`,
      `MOCK_TOKEN_DECIMALS=${tokenDecimals}`,
      `TOKEN_PRICE_USD_8=${tokenPriceUsd8.toString()}`,
      `NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=${auctionAddress}`,
      `NEXT_PUBLIC_BID_TOKEN_ADDRESS=${mockTokenAddress}`,
    ].join("\n");

    const generatedEnvFile = `${deploymentsDir}/base-sepolia.generated.env`;
    fs.writeFileSync(generatedEnvFile, `${generatedEnv}\n`);
    console.log(`Generated env file: ${generatedEnvFile}`);
  }

  if (autoVerify) {
    if (!process.env.BASESCAN_API_KEY) {
      throw new Error("AUTO_VERIFY=true but BASESCAN_API_KEY is not set");
    }

    console.log("Verifying TokenAuction...");
    execSync(
      `npx hardhat verify --network baseSepolia ${auctionAddress} \"${resourceName}\" \"${defaultResourceValue}\"`,
      { stdio: "inherit" }
    );

    console.log("Verifying MockERC20...");
    execSync(
      `npx hardhat verify --network baseSepolia ${mockTokenAddress} \"${tokenName}\" \"${tokenSymbol}\" ${initialSupply.toString()}`,
      { stdio: "inherit" }
    );
  }

  console.log("Bootstrap completed successfully.");
  console.log(`Summary: ${deploymentFile}`);
  console.log("Next: point frontend to NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS and NEXT_PUBLIC_BID_TOKEN_ADDRESS from generated env.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
