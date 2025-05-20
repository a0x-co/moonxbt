import { AUCTION_ABI, AUCTION_CONTRACT_ADDRESS } from "@/constants/contracts";
import { formatEther } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

export interface ResourceValue {
  url: string;
  metadata?: string;
}

export interface AuctionData {
  currentAuctionId: bigint | undefined;
  timeRemaining: bigint | undefined;
  formattedTimeLeft: string;
  currentBidder: `0x${string}` | undefined;
  currentBidAmount: bigint | undefined;
  formattedBidAmount: string;
  currentResourceValue: string | undefined;
  parsedResourceValue: ResourceValue | null;
  lastAuctionWinner: `0x${string}` | undefined;
  lastAuctionAmount: bigint | undefined;
  lastAuctionResourceValue: string | undefined;
  isLoading: boolean;
}

export function useAuctionData(): AuctionData {
  const {
    data: auctionData,
    isPending: isLoadingAuctionContracts,
    error: auctionContractsError,
  } = useReadContracts({
    contracts: [
      {
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "currentAuctionId",
      },
      {
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "getTimeRemaining",
      },
      {
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "getLastAuctionWinner",
      },
    ],
  });

  const currentAuctionIdData = auctionData?.[0]?.result as bigint | undefined;
  const timeRemainingData = auctionData?.[1]?.result as bigint | undefined;
  const lastAuctionWinnerData = auctionData?.[2]?.result as
    | `0x${string}`
    | undefined;

  const {
    data: currentBidInfoData,
    isLoading: isLoadingBid,
    error: bidError,
  } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: "getBid",
    args: currentAuctionIdData ? [currentAuctionIdData] : undefined,
    query: {
      enabled: currentAuctionIdData !== undefined,
    },
  });

  const formatTime = (seconds: bigint | undefined): string => {
    if (!seconds || seconds <= BigInt(0)) return "00:00:00";
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const parseResourceValue = (
    value: string | undefined
  ): ResourceValue | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as ResourceValue;
    } catch (e) {
      console.error("Failed to parse resource value:", e);
      return null;
    }
  };

  const [currentBidder, currentBidAmount, currentResourceValue] =
    (currentBidInfoData as [string, bigint, string] | undefined) ?? [
      undefined,
      undefined,
      undefined,
    ];

  const [lastAuctionWinner, lastAuctionAmount, lastAuctionResourceValue] =
    (lastAuctionWinnerData as [string, bigint, string] | undefined) ?? [
      undefined,
      undefined,
      undefined,
    ];

  return {
    currentAuctionId: currentAuctionIdData,
    timeRemaining: timeRemainingData,
    formattedTimeLeft: formatTime(timeRemainingData),
    currentBidder: currentBidder as `0x${string}` | undefined,
    currentBidAmount: currentBidAmount,
    formattedBidAmount: currentBidAmount
      ? `${formatEther(currentBidAmount)} A0X`
      : "0 A0X",
    currentResourceValue,
    parsedResourceValue: parseResourceValue(currentResourceValue),
    isLoading: isLoadingAuctionContracts || isLoadingBid,
    lastAuctionWinner: lastAuctionWinner as `0x${string}` | undefined,
    lastAuctionAmount: lastAuctionAmount,
    lastAuctionResourceValue: lastAuctionResourceValue,
  };
}
