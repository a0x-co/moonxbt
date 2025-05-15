import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI } from "@/constants/contracts";

// Hook for placing bids in the auction
export const useBid = (
  bidAmount: string,
  resourceUrl: string,
  resourceMetadata: string = "N/A",
  callback?: (txHash: `0x${string}`) => void
) => {
  const { chainId } = useAccount();

  // Prepare the resource information
  const resourceValue = JSON.stringify({
    url: resourceUrl,
    metadata: resourceMetadata,
  });

  // Prepare the transaction simulation
  const simulate = useSimulateContract({
    address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    chainId: chainId,
    abi: AUCTION_ABI,
    functionName: "placeBid",
    args: [parseEther(bidAmount || "0"), resourceValue],
    query: {
      enabled: !!bidAmount && !!resourceUrl,
    },
  });

  // Hook for executing the transaction
  const write = useWriteContract();

  // Wait for the transaction receipt
  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      meta: {
        successMessage: `Successfully placed bid of ${bidAmount} A0X`,
      },
    },
  });

  const callbackExecuted = useRef(false);
  const lastTransactionHash = useRef<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (write.data && write.data !== lastTransactionHash.current) {
      lastTransactionHash.current = write.data;
      callbackExecuted.current = false;
    }
    if (wait.isSuccess && callback && !callbackExecuted.current) {
      callback(write.data!);
      callbackExecuted.current = true;
    }
  }, [wait.isSuccess, callback, write.data]);

  // Function to execute the bid
  const placeBid = () => {
    if (!simulate.data) return;

    write.writeContract(simulate.data.request);
  };

  return {
    placeBid,
    isLoading: write.isPending || wait.isLoading,
    isSuccess: wait.isSuccess,
    isError: wait.isError,
    simulate,
    wait,
  };
};
