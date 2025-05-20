// ... (imports remain the same)

import { AUCTION_ABI, AUCTION_CONTRACT_ADDRESS } from "@/constants/contracts";
import { useEffect, useRef } from "react";
import { getAddress, parseEther } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const useBid = (
  bidAmount: string,
  resourceUrl: string,
  resourceMetadata: string = "N/A",
  callback?: (txHash: `0x${string}`) => void
) => {
  const { chainId } = useAccount();

  let resourceValue: string;
  try {
    resourceValue = JSON.stringify({
      url: resourceUrl,
      metadata: resourceMetadata,
    });
  } catch (e) {
    console.error("Error stringifying resource value:", e);
    resourceValue = ""; // Fallback or handle more explicitly if needed
  }

  const contractAddress = getAddress(AUCTION_CONTRACT_ADDRESS);

  // Prepare the transaction simulation
  const simulate = useSimulateContract({
    address: contractAddress,
    chainId: chainId,
    abi: AUCTION_ABI,
    functionName: "placeBid",
    args: [parseEther(bidAmount || "0"), resourceValue],
    query: {
      // Enable simulation only if bidAmount is a non-empty string,
      // can be parsed to a positive number, and resourceUrl is provided.
      // Added a check for bidAmount being a valid number before parsing
      enabled:
        !!bidAmount &&
        bidAmount !== "0" &&
        !isNaN(parseFloat(bidAmount)) &&
        parseFloat(bidAmount) > 0 &&
        !!resourceUrl,
      // Aumentar staleTime para que la simulación cacheada dure más
      staleTime: 60_000, // Example: cache simulation for 60 seconds (1 minute)
      // Opcional: Desactivar refetch al enfocar la ventana si es molesto
      // refetchOnWindowFocus: false,
      // Opcional: Configurar reintentos más agresivos si el RPC es inestable,
      // aunque wagmi/react-query ya tienen defaults razonables para 429/timeouts.
      // retry: 3, // number of retries
      // retryDelay: 1000, // delay between retries in ms
    },
  });

  // Hook for executing the transaction
  const write = useWriteContract();

  // Wait for the transaction receipt
  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      enabled: !!write.data,
      meta: {
        successMessage: `Successfully placed bid of ${bidAmount} A0X`,
      },
    },
  });

  // --- Callback Execution Logic (Remains the same) ---
  const callbackExecuted = useRef(false);
  const lastTransactionHash = useRef<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (write.data && write.data !== lastTransactionHash.current) {
      lastTransactionHash.current = write.data;
      callbackExecuted.current = false;
    }
    if (wait.isSuccess && callback && !callbackExecuted.current) {
      if (write.data) {
        callback(write.data);
        callbackExecuted.current = true;
      }
    }
  }, [wait.isSuccess, callback, write.data]);

  // --- Derived States and Error Handling ---

  // Combined error (could be from simulate, write, or wait)
  const error = simulate.error || write.error || wait.error;
  const isError = !!error;

  // Combined loading states
  // isPending in write means wallet modal is open/waiting for user action
  const isLoading = simulate.isLoading || write.isPending || wait.isLoading;

  // Success is only when the transaction receipt is successfully received
  const isSuccess = wait.isSuccess;

  // Determine a more granular status
  let status:
    | "idle"
    | "simulating"
    | "prompting"
    | "pending"
    | "success"
    | "error"
    | "simulation_error" = "idle"; // Added 'simulation_error'
  if (simulate.isLoading) {
    status = "simulating";
  } else if (simulate.isError) {
    // Specific status for simulation errors
    status = "simulation_error";
  } else if (simulate.isSuccess && write.isIdle) {
    status = "idle"; // Simulation successful, ready to prompt
  } else if (write.isPending) {
    status = "prompting"; // Wallet modal is open
  } else if (write.data && wait.isLoading) {
    status = "pending"; // Transaction sent, waiting for block confirmation
  } else if (wait.isSuccess) {
    status = "success";
  } else if (write.isError || wait.isError) {
    // Check write or wait errors for final 'error' status
    status = "error";
  }

  // Function to execute the bid transaction
  const placeBid = () => {
    // Re-check simulation status before triggering write
    // We still prevent writing if simulation failed because it indicates
    // the transaction WILL fail on-chain or gas estimation is impossible.
    if (!simulate.data || simulate.isError) {
      console.error(
        "Cannot place bid: Simulation failed or not ready.",
        simulate.error
      );
      // The component using the hook should handle displaying the error message.
      return;
    }

    write.reset(); // Good practice to reset before a new transaction attempt
    write.writeContract(simulate.data.request);
  };

  return {
    placeBid,
    // Expose granular loading/error states explicitly for the component's UI
    isSimulating: simulate.isLoading,
    isSimulationError: simulate.isError, // Explicit simulation error state
    simulationError: simulate.error, // The simulation error object
    isPromptingWallet: write.isPending,
    isWriting: write.isPending, // Alias for clarity
    isWaitingForConfirmation: wait.isLoading,
    isBidSuccess: wait.isSuccess, // Alias for clarity
    isBidError: isError, // Overall error flag (sim, write, or wait)
    bidError: error, // Overall error object
    bidStatus: status, // Granular status

    // Keep original combined states for convenience
    isLoading, // Combines simulate.isLoading, write.isPending, wait.isLoading
    isSuccess, // Same as isBidSuccess
    isError, // Same as isBidError

    simulate, // Expose individual hooks if needed
    write,
    wait,
    reset: write.reset,
  };
};
