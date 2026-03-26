import { http, createConfig } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { targetChain, targetRpcUrl } from "@/config/chainConfig";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [targetChain],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [targetChain.id]: http(targetRpcUrl),
  },
}); 