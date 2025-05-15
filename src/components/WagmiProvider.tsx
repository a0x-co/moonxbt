// "use client";

// import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { WagmiProvider as WagmiConfigProvider } from "wagmi";
// import { config } from "@/config/wagmiConfig";

// const queryClient = new QueryClient();

// export function WagmiProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <WagmiConfigProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider
//           theme={darkTheme({
//             accentColor: "#1752F0",
//             accentColorForeground: "white",
//             borderRadius: "medium",
//           })}
//         >
//           {children}
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiConfigProvider>
//   );
// }
