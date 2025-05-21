import { AUCTION_ABI, AUCTION_CONTRACT_ADDRESS } from "@/constants/contracts";
import { formatEther } from "viem";
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
    refetch: refetchBid,
  } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: "getBid",
    args: currentAuctionIdData ? [currentAuctionIdData] : undefined,
    query: {
      enabled: currentAuctionIdData !== undefined,
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
    timeRemaining: localTimeRemaining,
    formattedTimeLeft,
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
    refetchAuctionData,
    refetchBid,
  };
}
