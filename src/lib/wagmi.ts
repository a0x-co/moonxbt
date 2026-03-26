import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL
    ),
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL ||
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL
    ),
  },
}); 