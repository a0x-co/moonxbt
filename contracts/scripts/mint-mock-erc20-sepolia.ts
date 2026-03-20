import { createPublicClient, createWalletClient, getAddress, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import "dotenv/config";

const mockErc20Abi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function main() {
  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    throw new Error("BASE_SEPOLIA_RPC_URL is required");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required");
  }
  if (!process.env.MOCK_TOKEN_ADDRESS) {
    throw new Error("MOCK_TOKEN_ADDRESS is required");
  }

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const tokenAddress = getAddress(process.env.MOCK_TOKEN_ADDRESS);
  const mintTo = getAddress(process.env.MINT_TO || account.address);
  const mintDecimals = process.env.MOCK_TOKEN_DECIMALS
    ? Number(process.env.MOCK_TOKEN_DECIMALS)
    : 18;
  const mintAmountHuman = process.env.MINT_AMOUNT || "10000";

  if (!Number.isInteger(mintDecimals) || mintDecimals < 0 || mintDecimals > 18) {
    throw new Error("MOCK_TOKEN_DECIMALS must be an integer between 0 and 18");
  }

  const mintAmount = parseUnits(mintAmountHuman, mintDecimals);

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
  console.log(`Mock token: ${tokenAddress}`);
  console.log(`Minting ${mintAmountHuman} tokens to: ${mintTo}`);

  const before = (await publicClient.readContract({
    address: tokenAddress,
    abi: mockErc20Abi,
    functionName: "balanceOf",
    args: [mintTo],
  })) as bigint;

  const tx = await walletClient.writeContract({
    address: tokenAddress,
    abi: mockErc20Abi,
    functionName: "mint",
    args: [mintTo, mintAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: tx });

  const after = (await publicClient.readContract({
    address: tokenAddress,
    abi: mockErc20Abi,
    functionName: "balanceOf",
    args: [mintTo],
  })) as bigint;

  console.log(`Mint tx: ${tx}`);
  console.log(`Balance before: ${before.toString()}`);
  console.log(`Balance after : ${after.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
