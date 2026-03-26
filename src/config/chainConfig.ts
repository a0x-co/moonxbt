import { base, baseSepolia } from "wagmi/chains";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const envChain = requireEnv("NEXT_PUBLIC_MOONXBT_CHAIN").toLowerCase();

const envChainId = Number(process.env.NEXT_PUBLIC_MOONXBT_CHAIN_ID || "");

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
