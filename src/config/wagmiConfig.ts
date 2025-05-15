import { http } from "viem";
import { base } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

// if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
//   throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
// }

export const metadata = {
  name: "MoonXBT",
  description: "MoonXBT",
  url: "https://www.moonxbt.fun/",
  icons: ['"https://www.moonxbt.fun/assets/moonxbt-logo.svg"'],
};

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});
