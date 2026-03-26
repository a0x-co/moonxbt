This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Setup

This project requires certain environment variables to be set up. Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_MOONXBT_API_KEY=your_api_key_here
NEXT_PUBLIC_MOONXBT_API_SECRET=your_api_secret_here
NEXT_PUBLIC_MOONXBT_API_PASSPHRASE=your_passphrase_here

# Chain selection
# testnet (default) -> Base Sepolia
# mainnet -> Base
NEXT_PUBLIC_MOONXBT_CHAIN=testnet

# Optional explicit override (takes priority when set)
# NEXT_PUBLIC_MOONXBT_CHAIN_ID=8453

# RPC URLs
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=your_base_mainnet_rpc

# Contracts (set these for mainnet deployment)
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BID_TOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_A0X_CONTRACT_ADDRESS=0x...
```

Never commit these values to the repository. The `.env.local` file is automatically ignored by Git.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
