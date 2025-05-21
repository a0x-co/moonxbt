// Deployed contract address on Base
export const AUCTION_CONTRACT_ADDRESS =
  "0xa02ddbFDa3FD7Ded61Ca32f17BBDf322328bA2eB" as const;

export const USDC_CONTRACT_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// A0X token address on Base
export const A0X_CONTRACT_ADDRESS =
  "0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7" as const;

// Contract ABI
export const AUCTION_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_biddingToken", type: "address" },
      { internalType: "string", name: "_resourceName", type: "string" },
      { internalType: "string", name: "_defaultValue", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "resourceValue",
        type: "string",
      },
    ],
    name: "AuctionEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "resourceValue",
        type: "string",
      },
    ],
    name: "BidPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BidRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "auctionDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "auctionStartTimes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "biddingToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentAuctionId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "defaultResourceValue",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "finalizeAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "auctionId", type: "uint256" }],
    name: "getBid",
    outputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "string", name: "", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "auctionId", type: "uint256" }],
    name: "getBidder",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastAuctionWinner",
    outputs: [
      { internalType: "address", name: "winner", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "resourceValue", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTimeRemaining",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastAuctionResourceValue",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastAuctionWinner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastAuctionWinningAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "resourceValue", type: "string" },
    ],
    name: "placeBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resourceName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newDuration", type: "uint256" }],
    name: "setAuctionDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newToken", type: "address" }],
    name: "setBiddingToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newValue", type: "string" }],
    name: "setDefaultResourceValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
