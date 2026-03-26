import { base, baseSepolia } from "wagmi/chains";

const CLIENT_ENV = {
  NEXT_PUBLIC_MOONXBT_CHAIN: process.env.NEXT_PUBLIC_MOONXBT_CHAIN,
  NEXT_PUBLIC_MOONXBT_CHAIN_ID: process.env.NEXT_PUBLIC_MOONXBT_CHAIN_ID,
  NEXT_PUBLIC_BASE_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL,
  NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
} as const;

function requireEnv(name: keyof typeof CLIENT_ENV): string {
  const value = CLIENT_ENV[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const envChain = requireEnv("NEXT_PUBLIC_MOONXBT_CHAIN").toLowerCase();

const envChainId = Number(CLIENT_ENV.NEXT_PUBLIC_MOONXBT_CHAIN_ID || "");

function resolveTargetChain() {
  if (envChainId === base.id || envChain === "mainnet") {
    return base;
  }

  return baseSepolia;
}

export const targetChain = resolveTargetChain();
export const targetChainId = targetChain.id;
export const targetChainName = targetChain.name;

export const targetRpcUrl =
  targetChain.id === base.id
    ? requireEnv("NEXT_PUBLIC_BASE_MAINNET_RPC_URL")
    : requireEnv("NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL");
