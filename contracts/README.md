# TokenAuction Project

A Solidity smart contract for auctioning token-controlled resources on the Base blockchain.

## Overview

The TokenAuction contract enables recurring auctions where users bid with ERC20 tokens to control a resource value (such as a URL destination). Each auction runs for a configurable duration, and the highest bidder at the end of the auction wins control of the resource until the next auction concludes.

## Features

- **ERC20 Token Bidding**: Users bid using any ERC20 token
- **Recurring Auctions**: Automatic creation of new auctions after each auction ends
- **Configurable Parameters**: Customizable auction duration and default resource value
- **Owner Controls**: Contract owner can update bidding token, auction duration, and default resource value
- **Automatic Refunds**: Previous bidders are automatically refunded when outbid

## Project Structure

```
├── contracts/                 # Smart contracts
│   ├── TokenAuction.sol       # Main auction contract
│   └── MockERC20.sol          # Mock ERC20 token for testing
├── ignition/                  # Hardhat Ignition deployment modules
│   └── modules/
│       └── TokenAuction.ts    # TokenAuction deployment module
├── scripts/                   # Deployment scripts
│   └── deploy-token-auction.ts # Script for deploying to Base
├── test/                      # Comprehensive test suite
│   ├── TokenAuction.ts        # Main contract tests
│   ├── TokenAuctionErrors.ts  # Error handling tests
│   ├── TokenAuctionEvents.ts  # Event emission tests
│   ├── TokenAuctionGas.ts     # Gas usage tests
│   ├── TokenAuctionIntegration.ts # Integration tests
│   ├── MockERC20.ts           # Mock token tests
│   ├── DeployTokenAuction.ts  # Deployment script tests
│   ├── IgnitionModule.ts      # Ignition module tests
│   ├── helpers/               # Test helpers
│   │   └── time.ts            # Time manipulation helpers
│   ├── test-config.ts         # Shared test configuration
│   ├── index.ts               # Test entry point
│   └── README.md              # Test documentation
├── .env.example               # Example environment variables
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- An Ethereum wallet with Base ETH for deployment

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   For Base mainnet deployment, you can also start from:
   ```bash
   cp .env.mainnet.example .env
   ```

4. Fill in your environment variables in the `.env` file:
   ```
   BASE_RPC_URL=<your-base-rpc-url>
   PRIVATE_KEY=<your-private-key>
   QR_TOKEN_ADDRESS=<optional-token-address>
   ```

### Compiling

Compile the contracts:

```bash
npm run compile
```

### Testing

Run the test suite:

```bash
npm test
```

For more testing options, see the [test documentation](./test/README.md).

### Deployment

Deploy to Base using the automated script:

```bash
npm run deploy:base
```

This script will:
1. Fetch current gas prices from the Base network
2. Estimate deployment costs
3. Deploy the TokenAuction contract using Hardhat Ignition
4. Provide a detailed deployment report

#### Deployment Parameters

The deployment script accepts the following parameters (with defaults):

- `biddingTokenAddress`: The ERC20 token used for bidding (default: QR token)
- `resourceName`: The name of the resource being auctioned (default: "QR Destination URL")
- `defaultResourceValue`: The default value when no bids exist (default: "https://qrcoin.fun")
- `maxFeePerGas`: Maximum fee per gas (auto-calculated from network)
- `maxPriorityFeePerGas`: Maximum priority fee per gas (auto-calculated from network)

### Manual Deployment with Ignition

You can also deploy manually using Hardhat Ignition:

```bash
npx hardhat ignition deploy ignition/modules/TokenAuction.ts --network base --parameters biddingTokenAddress=0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF,resourceName="QR Destination URL",defaultResourceValue="https://qrcoin.fun"
```

## Contract Usage

### Placing a Bid

To place a bid, users must:
1. Approve the TokenAuction contract to spend their tokens
2. Call the `placeBid` function with their bid amount and desired resource value

```solidity
// Approve token spending
IERC20(tokenAddress).approve(tokenAuctionAddress, bidAmount);

// Place bid
TokenAuction(tokenAuctionAddress).placeBid(bidAmount, "https://example.com");
```

### Finalizing an Auction

Anyone can finalize an auction after the auction duration has passed:

```solidity
TokenAuction(tokenAuctionAddress).finalizeAuction();
```

### Owner Functions

The contract owner can:

1. Set the bidding token:
   ```solidity
   TokenAuction(tokenAuctionAddress).setBiddingToken(newTokenAddress);
   ```

2. Set the auction duration:
   ```solidity
   TokenAuction(tokenAuctionAddress).setAuctionDuration(newDurationInSeconds);
   ```

3. Set the default resource value:
   ```solidity
   TokenAuction(tokenAuctionAddress).setDefaultResourceValue("https://newdefault.com");
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
