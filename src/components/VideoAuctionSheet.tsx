"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shadcn/sheet";
// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { useContractWrite, useAccount, useDisconnect, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import {
  A0X_CONTRACT_ADDRESS,
  AUCTION_CONTRACT_ADDRESS,
} from "@/constants/contracts";
import { useApprove } from "@/hooks/useApprove";
import { useAuctionData } from "@/hooks/useAuctionData";
import {
  useLogout,
  usePrivy,
  useSendTransaction as useSendTransactionPrivy,
  useWallets,
} from "@privy-io/react-auth";
import { ethers } from "ethers";
import { encodeFunctionData, erc20Abi, formatUnits, parseEther } from "viem";
import { base } from "viem/chains";
import {
  useDisconnect,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { BidForm } from "./BidForm";
import Image from "next/image";
import { FaRegClock, FaTrophy, FaCoins } from "react-icons/fa";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VideoAuctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOONXBT_BLUE = "#1A6AFF";
const GRAY_BG = "#F3F4F6";
const GRAY_LABEL = "#6B7280";
const WHITE = "#fff";
const timerPulse = false; // Replace with real logic for last 10s

export function VideoAuctionSheet({ isOpen, onClose }: VideoAuctionSheetProps) {
  const { sendTransaction: sendTransactionPrivy } = useSendTransactionPrivy();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [isApproving, setIsApproving] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [bidTxHash, setBidTxHash] = useState<`0x${string}` | undefined>();
  const [wasConnected, setWasConnected] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [rawBidAmountInput, setRawBidAmountInput] = useState("");
  const [rawResourceUrlInput, setRawResourceUrlInput] = useState("");
  const [rawResourceMetadataInput, setRawResourceMetadataInput] = useState("");
  const [urlError, setUrlError] = useState("");

  // Use the custom hook for auction data
  const {
    currentAuctionId,
    formattedTimeLeft,
    currentBidder,
    formattedBidAmount,
    parsedResourceValue,
    isLoading: isLoadingAuctionData,
    lastAuctionWinner,
    lastAuctionAmount,
    lastAuctionResourceValue,
  } = useAuctionData();

  // Parse lastAuctionResourceValue as JSON if possible
  let parsedLastAuctionResourceValue: {
    url?: string;
    metadata?: string;
  } | null = null;
  if (lastAuctionResourceValue) {
    try {
      parsedLastAuctionResourceValue = JSON.parse(lastAuctionResourceValue);
    } catch (e) {
      parsedLastAuctionResourceValue = null;
    }
  }

  // Check A0x allowance
  const {
    data: allowanceData,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: A0X_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      wallet?.address as `0x${string}`,
      AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    ],
    chainId: base.id,
    query: {
      enabled: !!wallet?.address,
    },
  });

  // Check A0X balance
  const { data: balanceOfA0X, refetch: refetchBalanceOfA0X } = useReadContract({
    address: A0X_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet?.address as `0x${string}`],
    chainId: base.id,
    query: {
      enabled: !!wallet?.address,
    },
  });

  const formattedBalanceOfA0X = Number(
    formatUnits(balanceOfA0X || BigInt(0), 18)
  ).toFixed(2);

  const { isLoading: isConfirmingBid, isSuccess: isBidSuccess } =
    useWaitForTransactionReceipt({
      hash: bidTxHash,
      query: {
        enabled: Boolean(bidTxHash),
      },
    });

  // Handle wallet connection changes
  useEffect(() => {
    if (wallet?.address && !wasConnected) {
      setWasConnected(true);
      setIsWalletModalOpen(false);
    } else if (!wallet?.address) {
      setWasConnected(false);
    }
  }, [wallet?.address, wasConnected]);

  // ---------- APPROVE TRANSACTION -------
  const {
    write: writeApprove,
    isLoading: isConfirmingApproval,
    simulate: simulateApprove,
  } = useApprove(
    A0X_CONTRACT_ADDRESS as `0x${string}`,
    "A0X",
    AUCTION_CONTRACT_ADDRESS as `0x${string}`,
    true,
    parseEther("0"),
    async (txHash) => {
      console.log("Approved", txHash);
      refetchAllowance();
      setApproveTxHash(txHash);
    }
  );

  // Handle approve token
  const handleApproveClick = async () => {
    if (!wallet?.address) return;
    let tx;
    try {
      setIsApproving(true);
      await wallet.switchChain(base.id);

      // Prepare approval data
      const erc20Interface = new ethers.Interface(erc20Abi);
      const approveDataPrivy = erc20Interface.encodeFunctionData("approve", [
        AUCTION_CONTRACT_ADDRESS as `0x${string}`,
        parseEther("0"),
      ]);

      const approveDataWagmi = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [AUCTION_CONTRACT_ADDRESS as `0x${string}`, parseEther("0")],
      });

      if (!user) {
        console.error("No user found");
        return;
      }
      if (user.wallet && user.wallet.walletClientType !== "privy") {
        if (simulateApprove.data?.request != null) {
          writeApprove?.writeContract(simulateApprove?.data?.request);
        }
        console.log(
          "Sending approval transaction with wagmi",
          approveDataWagmi
        );
      } else {
        tx = await sendTransactionPrivy(
          {
            to: A0X_CONTRACT_ADDRESS as `0x${string}`,
            value: 0,
            data: approveDataPrivy as `0x${string}`,
            chainId: base.id,
          },
          {
            uiOptions: { showWalletUIs: true },
            fundWalletConfig: {
              amount: parseEther("1000000").toString(),
              asset: {
                erc20: A0X_CONTRACT_ADDRESS as `0x${string}`,
              },
              card: { preferredProvider: "moonpay" },
            },
          }
        );
      }
      console.log("Approval transaction sent:", tx?.hash);
      setApproveTxHash(tx?.hash);
      refetchAllowance();
    } catch (error) {
      console.error("Error approving token:", error);
      setIsApproving(false);
    } finally {
      setIsApproving(false);
    }
  };

  // Only test: handle revoke approval
  const handleRevokeApprovalClick = async () => {
    if (!wallet?.address) return;
    let tx;
    try {
      setIsApproving(true);
      await wallet.switchChain(base.id);

      // Prepare approval data
      const erc20Interface = new ethers.Interface(erc20Abi);
      const approveDataPrivy = erc20Interface.encodeFunctionData("approve", [
        AUCTION_CONTRACT_ADDRESS as `0x${string}`,
        parseEther("0"),
      ]);

      const approveDataWagmi = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [AUCTION_CONTRACT_ADDRESS as `0x${string}`, parseEther("0")],
      });

      if (!user) {
        console.error("No user found");
        return;
      }
      if (user.wallet && user.wallet.walletClientType !== "privy") {
        if (simulateApprove.data?.request != null) {
          writeApprove?.writeContract(simulateApprove?.data?.request);
        }
        console.log(
          "Sending approval transaction with wagmi",
          approveDataWagmi
        );
      } else {
        tx = await sendTransactionPrivy(
          {
            to: A0X_CONTRACT_ADDRESS as `0x${string}`,
            value: 0,
            data: approveDataPrivy as `0x${string}`,
            chainId: base.id,
          },
          {
            uiOptions: { showWalletUIs: true },
            fundWalletConfig: {
              amount: parseEther("1000000").toString(),
              asset: {
                erc20: A0X_CONTRACT_ADDRESS as `0x${string}`,
              },
              card: { preferredProvider: "moonpay" },
            },
          }
        );
      }
      console.log("Approval transaction sent:", tx?.hash);
      setApproveTxHash(tx?.hash);
      refetchAllowance();
      isApproving;
    } catch (error) {
      console.error("Error approving token:", error);
      setIsApproving(false);
    } finally {
      setIsApproving(false);
    }
  };

  // Wallet connection handlers
  const { ready, authenticated, login } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  const { disconnect } = useDisconnect();
  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User logged out");
    },
  });

  const handleDisconnect = async () => {
    try {
      await logout();
      disconnect();
      setWasConnected(false);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  // Manejo de clics en botones
  const handleConnectClick = () => {
    login();
  };

  const handleChainClick = async () => {
    console.log(wallet);
    if (wallet) {
      try {
        await wallet.switchChain(base.id);
      } catch (error) {
        console.error("Error cambiando de red:", error);
      }
    }
  };

  // Componente personalizado de botón de wallet
  const renderWalletButton = () => (
    <div className="w-full">
      {!wallet?.address ? (
        <button
          onClick={handleConnectClick}
          type="button"
          className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white  text-sm rounded-lg border border-white/10 transition-all duration-300"
          disabled={disableLogin}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-[#1a237e]/20 rounded-lg p-3 flex items-center justify-between">
          <button
            onClick={() => {
              // Privy wallet no tiene showAccountModal, usando método externo
              if (wallet?.address) {
                // Abrir detalles de cuenta o alguna acción alternativa
                console.log("Detalles de cuenta");
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className=" text-sm text-white/80">
              {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)}
            </span>
          </button>
          <button
            onClick={handleDisconnect}
            className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
          >
            <span className=" text-sm">Disconnect</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  // Fix timerPulse: define as false for now (or add real logic if needed)
  const isApproved = true;
  const onApproveClick = () => {};
  const handleBidSubmit = () => {};
  const isMainButtonDisabled = false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-start z-50 bg-muted">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 text-muted-foreground text-2xl font-bold hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded transition z-20"
        aria-label="Close"
      >
        ×
      </button>
      <div className="w-full flex justify-center pt-8 pb-2">
        <Image src="/assets/moonxbt.png" alt="MoonXBT" width={40} height={40} className="rounded-full" />
      </div>
      <div className="w-full flex justify-center px-4 sm:px-8 md:px-12 overflow-y-auto" style={{maxHeight: '95vh'}}>
        <Card className="w-full max-w-xl mx-auto p-0">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-1 pb-2 pt-6">
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight text-center leading-tight antialiased">
              Bid for MoonXBT's Next Video
            </h1>
            <div className="text-primary font-semibold text-base tracking-widest uppercase">Auction #{currentAuctionId}</div>
          </div>
          <Separator className="mb-2" />
          {/* Auction Status Area: Responsive layout */}
          <div className="w-full flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-10 mb-4">
            {/* Left: Winning video card (desktop: left column, mobile: top) */}
            <div className="flex-1 w-full max-w-[380px] min-h-[340px] bg-gradient-to-br from-muted/80 to-white/90 border border-border rounded-2xl shadow-xl px-4 py-6 flex flex-col items-center justify-center gap-3 mb-2 sm:mb-0 text-center">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-sm uppercase tracking-widest mb-2">Winning Video</span>
              <div className="w-full flex flex-col items-center">
                <video
                  src={parsedLastAuctionResourceValue && parsedLastAuctionResourceValue.url ? parsedLastAuctionResourceValue.url : "/assets/moonxbtauction.mp4"}
                  controls
                  className="rounded-xl w-full max-h-56 object-cover border border-border shadow-md"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              {parsedLastAuctionResourceValue && parsedLastAuctionResourceValue.url && (
                <a
                  href={parsedLastAuctionResourceValue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline break-all font-medium mt-2"
                >
                  {parsedLastAuctionResourceValue.url}
                </a>
              )}
            </div>
            {/* Right: Last auction winner/status box (desktop: right column, mobile: below video) */}
            <div className="flex-1 w-full max-w-[380px] min-h-[220px] sm:min-h-[340px] bg-white/90 rounded-2xl shadow-xl px-4 py-3 sm:py-6 flex flex-col items-center sm:items-end justify-center gap-2 sm:gap-4 text-center sm:text-right">
              {lastAuctionWinner && (
                <div className="flex flex-col items-center sm:items-end gap-1">
                  <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    <FaTrophy className="text-primary text-base" />
                    Last Auction Winner
                  </span>
                  <span className="font-mono text-base text-foreground bg-background px-3 py-1 rounded border border-border shadow-inner">
                    {`${lastAuctionWinner.slice(0, 6)}...${lastAuctionWinner.slice(-4)}`}
                  </span>
                  {lastAuctionAmount && (
                    <span className="text-xs text-muted-foreground font-semibold">Bid: {lastAuctionAmount.toString()}</span>
                  )}
                </div>
              )}
              {/* Timer and Bid: 2 columns on mobile, 1 column on desktop */}
              <div className="flex flex-row sm:flex-col w-full gap-2 mt-2">
                <div className="flex flex-col items-center sm:items-end flex-1">
                  <span className="font-sora font-bold text-xl text-foreground tracking-tight">{isLoadingAuctionData ? "..." : formattedTimeLeft}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-medium">Time left</span>
                </div>
                <div className="flex flex-col items-center sm:items-end flex-1">
                  <span className="font-sora font-bold text-xl text-foreground tracking-tight">{isLoadingAuctionData ? "..." : formattedBidAmount}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-medium">Current Bid</span>
                </div>
              </div>
            </div>
          </div>
          {/* Wallet pill/card as a new row below the boxes, same width as Place Bid row */}
          {wallet?.address && (
            <div className="w-full max-w-[380px] mx-auto flex flex-row items-center justify-between bg-muted/60 rounded-lg px-3 py-2 mb-4 gap-2">
              <span className="flex items-center gap-2 font-mono text-xs text-foreground">
                <Image src="/assets/Base_Network_Logo.svg" alt="AOX" width={16} height={16} className="rounded-full" />
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
              <span className="flex items-center gap-1 bg-white text-primary font-bold px-2 py-1 rounded text-xs border border-border">
                <Image src="/assets/Base_Network_Logo.svg" alt="AOX" width={14} height={14} className="rounded-full" />
                {balanceOfA0X} AOX
              </span>
              <Button variant="link" size="sm" onClick={handleDisconnect} className="text-xs text-primary font-semibold px-2 py-0 h-auto whitespace-nowrap">
                Disconnect
              </Button>
            </div>
          )}
          {/* Place Bid row below wallet row, same width as boxes and other inputs */}
          <div className="flex flex-row gap-2 items-center mb-4 w-full">
            <Input
              id="bid-amount"
              type="number"
              placeholder="Enter your bid"
              value={rawBidAmountInput}
              onChange={(e) => setRawBidAmountInput(e.target.value)}
              className="flex-1 w-full bg-background text-foreground placeholder:text-muted-foreground text-base font-sora px-3 py-2 rounded border border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary)] transition min-h-[36px]"
              disabled={isMainButtonDisabled}
              min="0"
            />
            <Button
              type="button"
              onClick={isApproved ? handleBidSubmit : onApproveClick}
              className="w-auto min-w-[120px] flex items-center justify-center gap-2 text-lg font-bold h-[42px]"
              disabled={isMainButtonDisabled}
            >
              <span className="text-xl">🚀</span>
              Place Bid
            </Button>
          </div>
          {/* Resource URL */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Resource URL</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-primary/80 cursor-pointer">?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Link to video proposal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="resource-url"
              type="url"
              placeholder="Resource URL (e.g., https://...)"
              value={rawResourceUrlInput}
              onChange={(e) => setRawResourceUrlInput(e.target.value)}
              className={`w-full bg-background text-foreground placeholder:text-muted-foreground text-base font-mono px-3 py-2 rounded border border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary)] transition min-h-[36px] ${urlError ? "ring-2 ring-red-400" : ""}`}
              disabled={isMainButtonDisabled}
            />
            {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
          </div>
          {/* Metadata */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Metadata</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-primary/80 cursor-pointer">?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Optional creator info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="metadata"
              placeholder="Additional Metadata (optional)"
              value={rawResourceMetadataInput}
              onChange={(e) => setRawResourceMetadataInput(e.target.value)}
              className="w-full bg-background text-foreground placeholder:text-muted-foreground text-base font-mono px-3 py-2 rounded border border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary)] transition min-h-[36px]"
              rows={2}
              disabled={isMainButtonDisabled}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
