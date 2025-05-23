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
import Image from 'next/image';

interface VideoAuctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [shouldShowSheet, setShouldShowSheet] = useState(isOpen);
  const [bidAmount, setBidAmount] = useState<string>("0");

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
      setTimeout(() => setShouldShowSheet(true), 500);
    } else if (!wallet?.address) {
      setWasConnected(false);
    }
  }, [wallet?.address, wasConnected]);

  useEffect(() => {
    if (!isWalletModalOpen) {
      setShouldShowSheet(isOpen);
    }
  }, [isOpen, isWalletModalOpen]);

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
    parseEther(bidAmount || "0"),
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
        parseEther(bidAmount || "0"),
      ]);

      const approveDataWagmi = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [
          AUCTION_CONTRACT_ADDRESS as `0x${string}`,
          parseEther(bidAmount || "0"),
        ],
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
          className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
          disabled={disableLogin}
        >
          Connect Wallet
        </button>
      ) : wallet && wallet.chainId.split(":")[1] !== String(base.id) ? (
        <button
          onClick={handleChainClick}
          type="button"
          className="w-full py-2.5 px-4 bg-red-500/40 hover:bg-red-500/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
        >
          Change To Base
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
            <span className="font-mono text-sm text-white/80">
              {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)}
            </span>
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/50"
            >
              <path d="m6 9 6 6 6-6" />
            </svg> */}
          </button>
          <button
            onClick={handleDisconnect}
            className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
          >
            <span className="font-mono text-sm">Disconnect</span>
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

  return (
    <Sheet
      open={shouldShowSheet}
      onOpenChange={(open) => {
        if (!open && !isWalletModalOpen) {
          onClose();
        }
        setShouldShowSheet(open);
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[900px] bg-[#1752F0] border-none p-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-white">
            Exclusive Digital Item Auction
          </SheetTitle>
          {currentAuctionId !== undefined && (
            <p className="text-sm text-white/70">
              Auction #{currentAuctionId.toString()}
            </p>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Auction Status Section */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(30, 60, 180, 0.25)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <h3 className="font-mono text-lg text-white/90 mb-4">
              Current Auction Status
            </h3>
            {isLoadingAuctionData ? (
              <p className="text-white/70">Loading auction data...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-center shadow-lg">
                  <thead>
                    <tr>
                      <th
                        className="px-6 py-3 rounded-tl-lg bg-white/20 text-white font-bold tracking-wide border-b border-r-2 border-white/20"
                        style={{ backdropFilter: "blur(2px)" }}
                      >
                        Time Remaining
                      </th>
                      <th
                        className="px-6 py-3  bg-white/20 text-white font-bold tracking-wide border-b border-r-2 border-white/20"
                        style={{ backdropFilter: "blur(2px)" }}
                      >
                        Current Highest Bid
                      </th>
                      {parsedResourceValue?.url && (
                        <th
                          className="px-6 py-3 bg-white/20 text-white font-bold tracking-wide border-b border-r-2 border-white/20"
                          style={{ backdropFilter: "blur(2px)" }}
                        >
                          Current URL
                        </th>
                      )}
                      {parsedResourceValue?.metadata &&
                        parsedResourceValue.metadata !== "N/A" && (
                          <th
                            className="px-6 py-3 bg-white/20 text-white font-bold tracking-wide border-b border-r-2 border-white/20"
                            style={{ backdropFilter: "blur(2px)" }}
                          >
                            Metadata
                          </th>
                        )}
                      {currentBidder &&
                        currentBidder !==
                          "0x0000000000000000000000000000000000000000" && (
                          <th
                            className="px-6 py-3 rounded-tr-lg bg-white/20 text-white font-bold tracking-wide border-b border-white/20"
                            style={{ backdropFilter: "blur(2px)" }}
                          >
                            Highest Bidder
                          </th>
                        )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-3 bg-white/10 rounded-bl-lg border-r-2 border-white/20">
                        <span
                          className="font-mono text-base text-white shadow-sm"
                          style={{ backdropFilter: "blur(2px)" }}
                        >
                          {formattedTimeLeft}
                        </span>
                      </td>
                      <td className="px-6 py-3 bg-white/10 border-r-2 border-white/20">
                        <span className="font-mono text-base text-white">
                          {formattedBidAmount}
                        </span>
                      </td>
                      {parsedResourceValue?.url && (
                        <td className="px-6 py-3 bg-white/10 border-r-2 border-white/20">
                          <a
                            href={parsedResourceValue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-base text-blue-200 hover:underline"
                            style={{ backdropFilter: "blur(2px)" }}
                          >
                            {parsedResourceValue.url}
                          </a>
                        </td>
                      )}
                      {parsedResourceValue?.metadata &&
                        parsedResourceValue.metadata !== "N/A" && (
                          <td className="px-6 py-3 bg-white/10 border-r-2 border-white/20">
                            <span
                              className="font-mono text-base text-white/80"
                              style={{ backdropFilter: "blur(2px)" }}
                            >
                              {parsedResourceValue.metadata}
                            </span>
                          </td>
                        )}
                      {currentBidder &&
                        currentBidder !==
                          "0x0000000000000000000000000000000000000000" && (
                          <td className="px-6 py-3 bg-white/10 rounded-br-lg">
                            <a
                              href={`https://basescan.org/address/${currentBidder}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-base text-blue-200 hover:underline"
                              style={{ backdropFilter: "blur(2px)" }}
                            >
                              {`${currentBidder.slice(
                                0,
                                6
                              )}...${currentBidder.slice(-4)}`}
                            </a>
                          </td>
                        )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Wallet Connection and Bid Form Section */}
          <div className="bg-[#1a237e]/20 rounded-lg p-4 space-y-4">
            {renderWalletButton()}

            {wallet?.address && (
              <BidForm
                isApproved={!!allowanceData && allowanceData > BigInt(0)}
                onApproveClick={handleApproveClick}
                isApproving={isApproving}
                isWritingBid={isBidding}
                isWaitingApproval={isConfirmingApproval}
                isWaitingBid={isConfirmingBid}
                balanceOfA0X={formattedBalanceOfA0X}
                bidAmount={bidAmount}
                setBidAmount={setBidAmount}
                handleRevokeApprovalClick={handleRevokeApprovalClick}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
