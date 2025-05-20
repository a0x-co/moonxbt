"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBid } from "@/hooks/useBid"; // Your refined hook
import { useState, useEffect, useRef } from "react";
// Keep useWriteContract if used elsewhere in parent, but not strictly needed here now
// import { useWriteContract } from "wagmi";

interface BidFormProps {
  isApproved: boolean;
  onApproveClick: () => void;
  isApproving: boolean; // Wallet modal open for approval (from parent)
  isWritingBid: boolean; // Wallet modal open for bid (from parent)
  isWaitingApproval: boolean; // Waiting for approval tx receipt (from parent)
  isWaitingBid: boolean; // Waiting for bid tx receipt (from parent)
  balanceOfA0X?: string;
  bidAmount: string; // Input value managed by parent
  setBidAmount: (amount: string) => void; // Setter for parent-managed bidAmount
  handleRevokeApprovalClick: () => void;
}

export function BidForm({
  isApproved,
  onApproveClick,
  isApproving,
  isWritingBid,
  isWaitingApproval,
  isWaitingBid,
  balanceOfA0X = "0",
  bidAmount: parentBidAmount,
  setBidAmount: setParentBidAmount,
  handleRevokeApprovalClick,
}: BidFormProps) {
  // Local states for raw input values (what the user is currently typing)
  const [rawBidAmountInput, setRawBidAmountInput] =
    useState<string>(parentBidAmount);
  const [rawResourceUrlInput, setRawResourceUrlInput] = useState<string>("");
  const [rawResourceMetadataInput, setRawResourceMetadataInput] =
    useState<string>("");

  // Debounced states (used for the hook dependencies)
  const [debouncedBidAmount, setDebouncedBidAmount] =
    useState<string>(parentBidAmount);
  const [debouncedResourceUrl, setDebouncedResourceUrl] = useState<string>("");
  const [debouncedResourceMetadata, setDebouncedResourceMetadata] =
    useState<string>("");

  // Effects to debounce inputs and update debounced states
  // Debounce rawBidAmountInput
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBidAmount(rawBidAmountInput);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler); // Cleanup previous timer on new keystroke
    };
  }, [rawBidAmountInput]);

  // Debounce rawResourceUrlInput
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedResourceUrl(rawResourceUrlInput);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [rawResourceUrlInput]);

  // Debounce rawResourceMetadataInput
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedResourceMetadata(rawResourceMetadataInput);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [rawResourceMetadataInput]);

  // Sync initial parentBidAmount prop to local state on mount/prop change
  useEffect(() => {
    setRawBidAmountInput(parentBidAmount);
    setDebouncedBidAmount(parentBidAmount); // Also update debounced on external change
  }, [parentBidAmount]);

  // --- ÚNICA LLAMADA AL HOOK useBid ---
  // Use the useBid hook with the DEBOUNCED values
  const {
    placeBid,
    isSimulating, // Is useSimulateContract loading?
    isSimulationError, // Did useSimulateContract return an error?
    simulationError, // The error object from useSimulateContract
    isPromptingWallet, // Is useWriteContract waiting for wallet confirmation?
    isWaitingForConfirmation, // Is useWaitForTransactionReceipt loading?
    isBidSuccess, // Did useWaitForTransactionReceipt succeed?
    isBidError, // Combined error state (sim, write, or wait)
    bidError, // Combined error object
    bidStatus, // Granular status string
    simulate, // Expose simulate hook state
  } = useBid(
    debouncedBidAmount, // Use debounced bid amount for the hook
    debouncedResourceUrl, // Use debounced resource URL for the hook
    debouncedResourceMetadata, // Use debounced resource metadata for the hook
    (txHash) => {
      console.log("Bid placed successfully, tx hash:", txHash);
      // Call parent setter to clear input or update parent state
      setParentBidAmount(""); // Clear parent's bidAmount state

      // Clear local form states only after successful tx confirmation
      setRawBidAmountInput("");
      setRawResourceUrlInput("");
      setRawResourceMetadataInput("");
      // You might want to call a parent callback here too, e.g., onBidSuccess(txHash)
    }
  );
  // --- FIN ÚNICA LLAMADA AL HOOK useBid ---

  const handleBidSubmit = () => {
    // Basic client-side validation on raw inputs before triggering
    const bidAmountFloat = parseFloat(rawBidAmountInput);
    if (
      !rawBidAmountInput ||
      isNaN(bidAmountFloat) ||
      bidAmountFloat <= 0 ||
      !rawResourceUrlInput
    ) {
      console.warn("Invalid bid amount or resource URL.");
      // Optionally show a user-friendly message for this validation failure
      return;
    }

    // Check simulation status/error using the states from the hook
    // *** IMPORTANT: KEEPING THIS CHECK IS RECOMMENDED ***
    // It prevents sending transactions that are predicted to fail or lack gas estimation.
    // If you *must* bypass this, you accept failed transactions and wasted gas for the user.
    if (simulate.isError || !simulate.data) {
      console.error(
        "Cannot place bid: Simulation failed or not ready.",
        simulate.error
      );
      // The UI messages below will show the simulation error if needed.
      // If you want to allow writing anyway, remove this return and the condition below in placeBid.
      // BUT THIS IS DANGEROUS!
      return;
    }

    // If simulation passed, trigger the write
    placeBid(); // Call the placeBid function returned by the useBid hook
  };

  // Function to set the bid amount as a percentage of the balance
  const setBidPercentage = (percentage: number) => {
    const balance = parseFloat(balanceOfA0X);
    if (balance > 0) {
      const amount = ((balance * percentage) / 100).toFixed(2);
      // Update both raw local state and parent state immediately
      setRawBidAmountInput(amount);
      setParentBidAmount(amount); // Update parent state immediately for percentage buttons
      // The debouncing effect for the hook will pick this up shortly for simulation
    }
  };

  // --- NUEVA LÓGICA PARA DESHABILITAR ELEMENTOS ---

  // State indicating if ANY transaction process is happening (approval OR bid)
  // This state will disable inputs and the revoke button
  const isTransactionInProgress =
    isApproving || // Parent's state for approval wallet prompt
    isWritingBid || // Parent's state for bid wallet prompt
    isWaitingApproval || // Parent's state for waiting approval tx receipt
    isWaitingBid || // Parent's state for waiting bid tx receipt
    isPromptingWallet || // Hook state for bid wallet prompt
    isWaitingForConfirmation; // Hook state for waiting bid tx receipt

  // Inputs and percentage buttons should be disabled ONLY when a transaction is in progress
  const areInputsDisabled = isTransactionInProgress;

  // The main action button (Approve or Place Bid) has more complex disabled logic:
  // Disabled if a transaction is in progress (approval or bid)
  // Disabled if inputs are invalid (amount is empty/zero/NaN, URL is empty)
  // Disabled if simulation is running or failed (can't place bid without sim)
  const isMainButtonDisabled = !isApproved
    ? isTransactionInProgress // Approve button disabled if any transaction is in progress
    : isTransactionInProgress || // Place Bid button disabled if any transaction is in progress
      !rawBidAmountInput || // Input validation: raw bid amount is empty
      isNaN(parseFloat(rawBidAmountInput)) || // Input validation: raw bid amount is not a number
      parseFloat(rawBidAmountInput) <= 0 || // Input validation: raw bid amount is zero or less
      !rawResourceUrlInput || // Input validation: raw URL is empty
      isSimulating || // Disabled while simulation is running
      isSimulationError; // Disabled if simulation failed

  // --- FIN NUEVA LÓGICA PARA DESHABILITAR ELEMENTOS ---

  // Determine button text based on states
  const buttonText = isWaitingApproval
    ? "Approving..."
    : isApproving
    ? "Check Wallet to Approve..."
    : isWaitingBid
    ? "Placing Bid..." // waiting for tx receipt (parent state)
    : isWaitingForConfirmation // waiting for tx receipt (hook state) - maybe use only one source? Assuming hook state is more reliable after write is triggered
    ? "Placing Bid..."
    : isWritingBid // Wallet modal is open/pending (parent state)
    ? "Check Wallet to Place Bid..."
    : isPromptingWallet // Wallet modal is open/pending (hook state) - same note as above
    ? "Check Wallet to Place Bid..."
    : isSimulating // Use the specific simulating state from the hook
    ? "Calculating Gas..."
    : !isApproved
    ? "Approve A0X Token"
    : "Place Bid";

  // Helper to determine which error message to show
  const errorMessage = isBidError // Overall error from the hook (write or wait)
    ? (bidError as Error)?.message
    : isSimulationError // Simulation specific error
    ? (simulationError as Error)?.message
    : // Add other potential input validation errors here if not handled by disabled state
      null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="number"
          placeholder={`Your bid amount (e.g., ${
            balanceOfA0X === "0"
              ? "10.5"
              : (parseFloat(balanceOfA0X) / 10).toFixed(2)
          })`}
          value={rawBidAmountInput} // Bind to local raw state
          onChange={(e) => {
            setRawBidAmountInput(e.target.value);
            // Update parent state immediately for percentage buttons to work based on input
            setParentBidAmount(e.target.value);
          }}
          className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
          disabled={areInputsDisabled} // Use new inputs disabled state
          min="0" // Add min="0" for better number input handling
        />

        {/* Percentage buttons */}
        <div className="grid grid-cols-4 gap-2">
          {/* Percentage buttons disabled based on areInputsDisabled and balance */}
          <Button
            type="button"
            onClick={() => setBidPercentage(25)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={areInputsDisabled || parseFloat(balanceOfA0X) <= 0}
          >
            25%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(50)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={areInputsDisabled || parseFloat(balanceOfA0X) <= 0}
          >
            50%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(75)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={areInputsDisabled || parseFloat(balanceOfA0X) <= 0}
          >
            75%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(100)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={areInputsDisabled || parseFloat(balanceOfA0X) <= 0}
          >
            100%
          </Button>
        </div>
        {/* Display balance */}
        <p className="text-xs text-white/60">Balance: {balanceOfA0X} A0X</p>
      </div>

      <Input
        type="url"
        placeholder="Resource URL (e.g., https://...)"
        value={rawResourceUrlInput} // Bind to local raw state
        onChange={(e) => setRawResourceUrlInput(e.target.value)} // Update local raw state
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        disabled={areInputsDisabled} // Use new inputs disabled state
      />

      <Textarea
        placeholder="Additional Metadata (optional)"
        value={rawResourceMetadataInput} // Bind to local raw state
        onChange={(e) => setRawResourceMetadataInput(e.target.value)} // Update local raw state
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        rows={2}
        disabled={areInputsDisabled} // Use new inputs disabled state
      />

      {/* Main action button */}
      <Button
        onClick={!isApproved ? onApproveClick : handleBidSubmit}
        className="w-full bg-[#ffeb3b]/80 hover:bg-[#ffeb3b] text-[#1a237e] font-bold"
        disabled={isMainButtonDisabled} // Use the calculated disabled state for the button
      >
        {buttonText}
      </Button>

      {/* Revoke Approval Button */}
      {isApproved && (
        <Button
          onClick={handleRevokeApprovalClick}
          className="w-full bg-[#ffeb3b]/80 hover:bg-[#ffeb3b] text-[#1a237e] font-bold"
          disabled={isTransactionInProgress} // Disable revoke button if any transaction is pending
        >
          Revoke Approval
        </Button>
      )}

      {/* Status/Loading Indicator */}
      {/* Show loading status based on specific states */}
      {(isApproving ||
        isWritingBid ||
        isWaitingApproval ||
        isWaitingBid ||
        isPromptingWallet ||
        isWaitingForConfirmation) && ( // Any transaction in progress state (approval or bid)
        <p className="text-xs text-center text-yellow-300/80">
          Processing transaction on the blockchain...
        </p>
      )}
      {/* Display simulating state specifically */}
      {isSimulating && ( // Only show this message when simulation is happening
        <p className="text-xs text-center text-yellow-300/80">
          Calculating Gas and Simulating Bid...
        </p>
      )}

      {/* Error Messages */}
      {/* Display any relevant error message */}
      {errorMessage && (
        <p className="text-xs text-center text-red-400">
          Error: {errorMessage}
        </p>
      )}

      {/* Success Message */}
      {isBidSuccess && (
        <p className="text-xs text-center text-green-400">
          Bid placed successfully!
        </p>
      )}
    </div>
  );
}
