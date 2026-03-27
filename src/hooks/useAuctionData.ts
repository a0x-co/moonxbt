import {
  AUCTION_ABI,
  AUCTION_CONTRACT_ADDRESS,
  BID_TOKEN_DECIMALS,
  BID_TOKEN_SYMBOL,
} from "@/constants/contracts";
import { targetChainId } from "@/config/chainConfig";
import { formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { useEffect, useState } from "react";

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
  refetchAuctionData: () => void;
  refetchBid: () => void;
}

export function useAuctionData(): AuctionData {
  const [localTimeRemaining, setLocalTimeRemaining] = useState<
    bigint | undefined
  >(undefined);
  const [formattedTimeLeft, setFormattedTimeLeft] =
    useState<string>("00:00:00");

  const {
    data: auctionData,
    isPending: isLoadingAuctionContracts,
    error: auctionContractsError,
    refetch: refetchAuctionData,
  } = useReadContracts({
    contracts: [
      {
        chainId: targetChainId,
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "currentAuctionId",
      },
      {
        chainId: targetChainId,
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "getTimeRemaining",
      },
      {
        chainId: targetChainId,
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: "getLastAuctionWinner",
      },
    ],
    query: {
      refetchInterval: 5_000,
      refetchOnWindowFocus: true,
    },
  });

  const currentAuctionIdData = auctionData?.[0]?.result as bigint | undefined;
  const timeRemainingData = auctionData?.[1]?.result as bigint | undefined;
  const lastAuctionWinnerData = auctionData?.[2]?.result as
    | [string, string, bigint, string]
    | undefined;

  const {
    data: currentBidInfoData,
    isLoading: isLoadingBid,
    error: bidError,
    refetch: refetchBid,
  } = useReadContract({
    chainId: targetChainId,
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: "getBid",
    args: currentAuctionIdData ? [currentAuctionIdData] : undefined,
    query: {
      enabled: currentAuctionIdData !== undefined,
      refetchInterval: 5_000,
      refetchOnWindowFocus: true,
    },
  });

  // Actualizar el tiempo local cuando cambia el tiempo del contrato
  useEffect(() => {
    if (timeRemainingData !== undefined) {
      setLocalTimeRemaining(timeRemainingData);
    }
  }, [timeRemainingData]);

  // Contador en tiempo real
  useEffect(() => {
    if (!localTimeRemaining || localTimeRemaining <= BigInt(0)) {
      setFormattedTimeLeft("00:00:00");
      return;
    }

    const formatTime = (seconds: bigint): string => {
      const totalSeconds = Number(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const remainingSeconds = totalSeconds % 60;

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Actualizar el tiempo formateado inmediatamente
    setFormattedTimeLeft(formatTime(localTimeRemaining));

    // Configurar el intervalo para actualizar cada segundo
    const interval = setInterval(() => {
      setLocalTimeRemaining((prev) => {
        if (!prev || prev <= BigInt(0)) {
          clearInterval(interval);
          return BigInt(0);
        }
        return prev - BigInt(1);
      });
    }, 1000);

    // Limpiar el intervalo cuando el componente se desmonte o el tiempo cambie
    return () => clearInterval(interval);
  }, [localTimeRemaining]);

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

  const [currentBidder, , currentBidAmount, currentResourceValue] =
    (currentBidInfoData as [string, string, bigint, string] | undefined) ?? [
      undefined,
      undefined,
      undefined,
      undefined,
    ];

  const [lastAuctionWinner, , lastAuctionAmount, lastAuctionResourceValue] =
    (lastAuctionWinnerData as [string, string, bigint, string] | undefined) ?? [
      undefined,
      undefined,
      undefined,
      undefined,
    ];

  const normalizeAddress = (value: string | undefined): `0x${string}` | undefined => {
    if (!value) return undefined;
    if (value.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      return undefined;
    }
    return value as `0x${string}`;
  };

  const normalizedCurrentBidder = normalizeAddress(currentBidder);
  const normalizedLastAuctionWinner = normalizeAddress(lastAuctionWinner);

  useEffect(() => {
    if (auctionContractsError) {
      console.error("Auction contract read error", {
        chainId: targetChainId,
        contract: AUCTION_CONTRACT_ADDRESS,
        error: auctionContractsError,
      });
    }
  }, [auctionContractsError]);

  useEffect(() => {
    if (bidError) {
      console.error("Auction bid read error", {
        chainId: targetChainId,
        contract: AUCTION_CONTRACT_ADDRESS,
        auctionId: currentAuctionIdData?.toString(),
        error: bidError,
      });
    }
  }, [bidError, currentAuctionIdData]);

  return {
    currentAuctionId: currentAuctionIdData,
    timeRemaining: localTimeRemaining,
    formattedTimeLeft,
    currentBidder: normalizedCurrentBidder,
    currentBidAmount: currentBidAmount,
    formattedBidAmount: currentBidAmount
      ? `${formatUnits(currentBidAmount, BID_TOKEN_DECIMALS)} ${BID_TOKEN_SYMBOL}`
      : `0 ${BID_TOKEN_SYMBOL}`,
    currentResourceValue,
    parsedResourceValue: parseResourceValue(currentResourceValue),
    isLoading: isLoadingAuctionContracts || isLoadingBid,
    lastAuctionWinner: normalizedLastAuctionWinner,
    lastAuctionAmount: lastAuctionAmount,
    lastAuctionResourceValue: lastAuctionResourceValue,
    refetchAuctionData,
    refetchBid,
  };
}

const projectData = {
  projectData: {
    name: "moonxbt",
    description:
      "I will create a short video of your product and post it on X, Farcaster, Telegram, Tiktok and Instagram...\nEveryday there's a new auction for tomorrow's video...moonxbt is going to create content everyday to promote projects, like a content creator doing 1 video a day for 1 winner  \n\nwith accounts on Farcaster, X, Zora, Instagram, Tiktok and Telegram, we are looking to get growing exposure to whatever you want to call attention  \n\nwhat's cool about moonxbt? she creates the content completely autonomously, scrapping your website, post, or link to understand whats the project about and create informative content about it  \n\nher success is your success, and for that, she needs high quality followers to bootstrap her social accounts  \n\nwe'll be launching her clanker shortly, and 20% of it will be for this airdrop  \n\nhow to increase your allocation? follow moon on all her socials, hold $A0x, and share this miniapp",
    websiteUrl: "https://moonxbt.fun",
  },
  cloudStorageService: true,
  scrapeWebsite: true,
  useCloudStorage: true,
  influencerId: "3e444822-7a6c-0e5d-a36d-7087fb23685b",
  voiceId: "L4ndSW2PzthljqHuvso3",
  captureWebsite: true,
  screenshotService: "screenshotmachine",
};
