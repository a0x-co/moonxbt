"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBid } from "@/hooks/useBid";
import { useState } from "react";
import { useWriteContract } from "wagmi";

interface BidFormProps {
  isApproved: boolean;
  onApproveClick: () => void;
  isApproving: boolean;
  isBidding: boolean;
  isConfirmingApproval: boolean;
  isConfirmingBid: boolean;
  balanceOfA0X?: string;
  bidAmount: string;
  setBidAmount: (amount: string) => void;
  handleRevokeApprovalClick: () => void;
}

export function BidForm({
  isApproved,
  onApproveClick,
  isApproving,
  isBidding,
  isConfirmingApproval,
  isConfirmingBid,
  balanceOfA0X = "0",
  bidAmount,
  setBidAmount,
  handleRevokeApprovalClick,
}: BidFormProps) {
  const [resourceUrl, setResourceUrl] = useState<string>("");
  const [resourceMetadata, setResourceMetadata] = useState<string>("");

  const { writeContract, isPending } = useWriteContract();

  // Use the useBid hook
  const {
    placeBid,
    isLoading: isBidLoading,
    isSuccess: isBidSuccess,
  } = useBid(bidAmount, resourceUrl, resourceMetadata, () => {
    // Reset form after successful bid
    setBidAmount("");
    setResourceUrl("");
    setResourceMetadata("");
  });

  const handleBidSubmit = () => {
    if (!bidAmount || !resourceUrl) return;
    placeBid();
  };

  // Función para establecer el valor del bid como un porcentaje del balance
  const setBidPercentage = (percentage: number) => {
    const balance = parseFloat(balanceOfA0X);
    if (balance > 0) {
      const amount = ((balance * percentage) / 100).toFixed(2);
      setBidAmount(amount);
    }
  };

  const isFormDisabled =
    isApproving ||
    isBidding ||
    isConfirmingApproval ||
    isConfirmingBid ||
    isBidLoading;
  const buttonText = isConfirmingApproval
    ? "Approving..."
    : isApproving
    ? "Check Wallet to Approve..."
    : isConfirmingBid
    ? "Placing Bid..."
    : isBidding || isBidLoading
    ? "Check Wallet to Place Bid..."
    : !isApproved
    ? "Approve A0X Token"
    : "Place Bid";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Your bid amount (e.g., 10.5)"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
          disabled={isFormDisabled}
        />

        <div className="grid grid-cols-4 gap-2">
          <Button
            type="button"
            onClick={() => setBidPercentage(25)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={isFormDisabled}
          >
            25%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(50)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={isFormDisabled}
          >
            50%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(75)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={isFormDisabled}
          >
            75%
          </Button>
          <Button
            type="button"
            onClick={() => setBidPercentage(100)}
            variant="outline"
            className="bg-[#1a237e]/30 hover:bg-[#1a237e]/50 text-white border-white/10"
            disabled={isFormDisabled}
          >
            100%
          </Button>
        </div>
      </div>

      <Input
        type="url"
        placeholder="Resource URL (e.g., https://...)"
        value={resourceUrl}
        onChange={(e) => setResourceUrl(e.target.value)}
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        disabled={isFormDisabled}
      />

      <Textarea
        placeholder="Additional Metadata (optional)"
        value={resourceMetadata}
        onChange={(e) => setResourceMetadata(e.target.value)}
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        rows={2}
        disabled={isFormDisabled}
      />

      <Button
        onClick={!isApproved ? onApproveClick : handleBidSubmit}
        className="w-full bg-[#ffeb3b]/80 hover:bg-[#ffeb3b] text-[#1a237e] font-bold"
        disabled={isFormDisabled || !bidAmount || !resourceUrl}
      >
        {buttonText}
      </Button>

      {isApproved && (
        <Button
          onClick={handleRevokeApprovalClick}
          className="w-full bg-[#ffeb3b]/80 hover:bg-[#ffeb3b] text-[#1a237e] font-bold"
        >
          Revoke Approval
        </Button>
      )}

      {(isConfirmingApproval || isConfirmingBid || isBidLoading) && (
        <p className="text-xs text-center text-yellow-300/80">
          Processing transaction on the blockchain...
        </p>
      )}
    </div>
  );
}
