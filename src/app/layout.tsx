// Next
import type { Metadata } from "next";
import { Space_Grotesk, Press_Start_2P, Orbitron } from "next/font/google";
import { headers } from "next/headers";

// Privy
import { config } from "@/config/wagmiConfig";
import Web3ModalProvider from "@/context";
import { cookieToInitialState } from "wagmi";

// App
import "./globals.css";

// Auth
import { getServerSession } from "./api/auth/options";

// const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
  weight: "400",
});

export const metadata: Metadata = {
  title: "MoonXBT",
  description: "MoonXBT - Your Based Content Creator",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1752F0" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const headerList = headers();
  const cookieStr = headerList.get("cookie") ?? "";

  const initialState = cookieToInitialState(config, cookieStr);
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} font-spaceGrotesk antialiased`}
      >
        <Web3ModalProvider initialState={initialState} session={session}>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  );
}
