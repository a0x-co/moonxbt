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
      ) : wallet && wallet.chainId.split(":")[1] !== String(base.id) ? (
        <button
          onClick={handleChainClick}
          type="button"
          className="flex items-center justify-center gap-2 text-center w-full py-2.5 px-4 bg-[#0466c8] hover:bg-[#0466c8]/60 text-white text-sm rounded-lg border border-white/10 transition-all duration-300"
        >
          Change To Base{" "}
          <Image
            src="/assets/Base_Network_Logo.svg"
            alt="Base"
            width={20}
            height={20}
          />
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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isWalletModalOpen) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[900px] bg-[#1752F0] border-none p-6 overflow-y-auto shadow-2xl"
      >
        <div className="flex flex-col gap-8">
          <SheetHeader>
            <SheetTitle className="text-4xl font-extrabold  text-white tracking-widest uppercase text-center font-orbitron">
              Bid for MoonXBT's next video
            </SheetTitle>
            {currentAuctionId !== undefined && (
              <p className="text-lg md:text-2xl  text-white/80 text-center mt-2">
                Auction #{currentAuctionId.toString()}
              </p>
            )}
          </SheetHeader>

          {/* Auction Status Section */}
          <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <FaRegClock className="text-cyan-200 text-3xl" />
                <span className=" text-3xl md:text-5xl font-extrabold text-white tracking-widest">
                  {isLoadingAuctionData ? "..." : formattedTimeLeft}
                </span>
              </div>
              <span className=" text-base text-white/70 uppercase tracking-widest">
                Time Remaining
              </span>
            </div>
            <div className="w-0.5 h-20 bg-white/20 hidden md:block" />
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <FaCoins className="text-cyan-200 text-3xl" />
                <span className=" text-3xl md:text-5xl font-extrabold text-white tracking-widest">
                  {isLoadingAuctionData ? "..." : formattedBidAmount}
                </span>
              </div>
              <span className=" text-base text-white/70 uppercase tracking-widest">
                Current Bid
              </span>
            </div>
          </div>

          {/* Current URL & Bidder */}
          <div className="flex flex-col md:flex-row gap-4">
            {parsedResourceValue?.url && (
              <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-inner flex flex-col gap-2">
                <span className=" text-xs text-white/60 uppercase tracking-widest">
                  Current URL
                </span>
                <a
                  href={parsedResourceValue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" text-base md:text-lg text-white hover:underline break-all"
                >
                  {parsedResourceValue.url}
                </a>
              </div>
            )}
            {currentBidder &&
              currentBidder !==
                "0x0000000000000000000000000000000000000000" && (
                <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-inner flex flex-col gap-2">
                  <span className=" text-xs text-white/60 uppercase tracking-widest">
                    Highest Bidder
                  </span>
                  <a
                    href={`https://basescan.org/address/${currentBidder}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" text-base md:text-lg text-white hover:underline"
                  >
                    {`${currentBidder.slice(0, 6)}...${currentBidder.slice(
                      -4
                    )}`}
                  </a>
                </div>
              )}
          </div>

          {/* Wallet Connection and Bid Form Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-[0_0_48px_#3a0ca3] flex flex-col gap-6">
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
                bidAmount="0"
                setBidAmount={(value) => {}}
                handleRevokeApprovalClick={handleRevokeApprovalClick}
              />
            )}
          </div>

          {/* Winner Section */}
          {lastAuctionWinner && (
            <div className="mt-4 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg flex flex-col gap-2 items-center">
              <div className="flex items-center gap-2 mb-2">
                <FaTrophy className="text-cyan-200 text-2xl" />
                <span className=" text-xl font-bold text-white uppercase tracking-widest">
                  Winner
                </span>
              </div>
              <span className=" text-base text-white/80">{`${lastAuctionWinner.slice(
                0,
                6
              )}...${lastAuctionWinner.slice(-4)}`}</span>
              {parsedLastAuctionResourceValue &&
                parsedLastAuctionResourceValue.url && (
                  <a
                    href={parsedLastAuctionResourceValue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" text-base text-white hover:underline break-all"
                  >
                    {parsedLastAuctionResourceValue.url}
                  </a>
                )}
              {lastAuctionAmount && (
                <span className=" text-lg text-white/80">
                  Bid: {lastAuctionAmount}
                </span>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
