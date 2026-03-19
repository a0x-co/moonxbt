"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSignOutAlt, FaTrophy, FaWallet } from "react-icons/fa";
import { erc20Abi, formatUnits, maxUint256, parseUnits } from "viem";
import { base } from "viem/chains";
import { useDisconnect, useReadContract } from "wagmi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AUCTION_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "@/constants/contracts";
import { useApprove } from "@/hooks/useApprove";
import { useAuctionData } from "@/hooks/useAuctionData";
import { useBid } from "@/hooks/useBid";
import {
  useLogout,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";

interface VideoAuctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tone = "subtle" | "balanced" | "bold";
type Mood = "sassy" | "playful" | "serious";
type JobStatus = "pending" | "processing" | "completed" | "failed";

const TONES: { value: Tone; label: string }[] = [
  { value: "subtle", label: "Subtle" },
  { value: "balanced", label: "Balanced" },
  { value: "bold", label: "Bold" },
];

const MOODS: { value: Mood; label: string }[] = [
  { value: "sassy", label: "Sassy" },
  { value: "playful", label: "Playful" },
  { value: "serious", label: "Serious" },
];

const CONTROL_HINTS = {
  tone: "How strong the wording feels in the generated script.",
  hype: "0% is chill energy. 100% is full degen energy.",
  mood: "Personality flavor of the final script voice.",
} as const;

const LOCAL_DEBUG_STEP2_BYPASS =
  process.env.NEXT_PUBLIC_LOCAL_DEBUG_STEP2_BYPASS === "true";

export function VideoAuctionSheet({ isOpen, onClose }: VideoAuctionSheetProps) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [hasPaid, setHasPaid] = useState(false);

  const [rawBidAmountInput, setRawBidAmountInput] = useState("");
  const [rawResourceUrlInput, setRawResourceUrlInput] = useState("");
  const [rawResourceMetadataInput, setRawResourceMetadataInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const [userPrompt, setUserPrompt] = useState("");
  const [tone, setTone] = useState<Tone>("balanced");
  const [hypePercent, setHypePercent] = useState(60);
  const [mood, setMood] = useState<Mood>("sassy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scriptUsed, setScriptUsed] = useState<string | null>(null);

  const {
    currentAuctionId,
    formattedTimeLeft,
    formattedBidAmount,
    isLoading: isLoadingAuctionData,
    lastAuctionWinner,
    lastAuctionAmount,
    lastAuctionResourceValue,
    refetchAuctionData,
    refetchBid,
  } = useAuctionData();

  const bidAmountUnits = useMemo(() => {
    try {
      return parseUnits(rawBidAmountInput || "0", 6);
    } catch {
      return BigInt(0);
    }
  }, [rawBidAmountInput]);

  const {
    data: allowanceData,
    refetch: refetchAllowance,
    isLoading: isLoadingAllowance,
  } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      (wallet?.address || "0x0000000000000000000000000000000000000000") as `0x${string}`,
      AUCTION_CONTRACT_ADDRESS,
    ],
    chainId: base.id,
    query: {
      enabled: Boolean(wallet?.address),
    },
  });

  const { data: balanceUSDC, refetch: refetchBalanceUSDC } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [
      (wallet?.address || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    ],
    chainId: base.id,
    query: {
      enabled: Boolean(wallet?.address),
    },
  });

  const allowance = (allowanceData as bigint | undefined) ?? BigInt(0);
  const isApproved = bidAmountUnits > BigInt(0) && allowance >= bidAmountUnits;

  const {
    write: writeApprove,
    isLoading: isConfirmingApproval,
    simulate: simulateApprove,
  } = useApprove(
    USDC_CONTRACT_ADDRESS,
    "USDC",
    AUCTION_CONTRACT_ADDRESS,
    !isApproved && bidAmountUnits > BigInt(0),
    maxUint256,
    async () => {
      await refetchAllowance();
    }
  );

  const {
    placeBid,
    isSimulating,
    isSimulationError,
    simulationError,
    isPromptingWallet,
    isWaitingForConfirmation,
    isBidSuccess,
    isBidError,
    bidError,
  } = useBid(
    rawBidAmountInput,
    rawResourceUrlInput,
    rawResourceMetadataInput,
    async () => {
      setHasPaid(true);
      setActiveStep(2);
      await Promise.all([
        refetchAllowance(),
        refetchBalanceUSDC(),
        refetchAuctionData(),
        refetchBid(),
      ]);
    },
    { tokenDecimals: 6, tokenSymbol: "USDC" }
  );

  const parsedLastAuctionResourceValue = useMemo(() => {
    if (!lastAuctionResourceValue) return null;
    try {
      return JSON.parse(lastAuctionResourceValue) as { url?: string; metadata?: string };
    } catch {
      return null;
    }
  }, [lastAuctionResourceValue]);

  const lastAuctionIdLabel = useMemo(() => {
    if (currentAuctionId === undefined || currentAuctionId === null) return "-";
    if (currentAuctionId <= BigInt(0)) return currentAuctionId.toString();
    return (currentAuctionId - BigInt(1)).toString();
  }, [currentAuctionId]);

  const formattedBalanceUSDC = Number(formatUnits(balanceUSDC || BigInt(0), 6)).toFixed(2);

  const isBidInputValid =
    rawBidAmountInput.trim().length > 0 &&
    Number(rawBidAmountInput) > 0 &&
    rawResourceUrlInput.trim().length > 0;

  const isAnyPending =
    isApproving || isConfirmingApproval || isPromptingWallet || isWaitingForConfirmation;

  const canSubmitBid = Boolean(wallet?.address && isBidInputValid && !isAnyPending && !isLoadingAllowance && !isSimulating);
  const canAccessStep2 = hasPaid || LOCAL_DEBUG_STEP2_BYPASS;

  const step1ButtonLabel = !wallet?.address
    ? "Connect Wallet"
    : !isApproved
    ? isAnyPending
      ? "Approving USDC..."
      : "Approve USDC"
    : isAnyPending
    ? "Placing Bid..."
    : isSimulating
    ? "Simulating..."
    : "Pay & Continue";

  const canGenerate = canAccessStep2 && userPrompt.trim().length > 0 && !isGenerating;
  const normalizedEnthusiasmLevel = useMemo(
    () => Math.max(1, Math.min(5, Math.round(hypePercent / 25) + 1)),
    [hypePercent]
  );

  const handleDisconnect = async () => {
    await logout();
    disconnect();
    setHasPaid(false);
    setActiveStep(1);
  };

  const handleApproveClick = async () => {
    if (!wallet?.address) return;
    try {
      setIsApproving(true);
      await wallet.switchChain(base.id);
      if (simulateApprove.data?.request) {
        writeApprove.writeContract(simulateApprove.data.request);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleBidSubmit = async () => {
    try {
      new URL(rawResourceUrlInput);
      setUrlError("");
    } catch {
      setUrlError("Please provide a valid URL (https://...) for your resource.");
      return;
    }

    if (!wallet?.address || !canSubmitBid) return;
    await wallet.switchChain(base.id);
    placeBid();
  };

  const handleStep1Action = async () => {
    if (!wallet?.address) {
      login();
      return;
    }
    if (!isApproved) {
      await handleApproveClick();
      return;
    }
    await handleBidSubmit();
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const pollJob = (newJobId: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/moonxbt/video/${newJobId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.job) {
          throw new Error(data?.error || "Failed to fetch job status");
        }

        const status = (data.job.status || "pending") as JobStatus;
        setJobStatus(status);
        if (data.job.scriptUsed) setScriptUsed(data.job.scriptUsed);
        if (data.job.videoUrl) setPreviewUrl(data.job.videoUrl);

        if (status === "completed" || status === "failed") {
          stopPolling();
          setIsGenerating(false);
        }
      } catch (error) {
        setGenerationError(error instanceof Error ? error.message : "Polling failed");
        stopPolling();
        setIsGenerating(false);
      }
    }, 7000);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerationError(null);
    setIsGenerating(true);
    setPreviewUrl(null);
    setScriptUsed(null);
    setJobStatus("pending");

    try {
      const res = await fetch("/api/moonxbt/video/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          tone,
            enthusiasmLevel: normalizedEnthusiasmLevel,
            hypePercent,
          mood,
          durationSeconds: 8,
          aspectRatio: "9:16",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.jobId) {
        throw new Error(data?.error || "Failed to start generation");
      }

      setJobId(data.jobId);
      if (data.scriptUsed) setScriptUsed(data.scriptUsed);
      pollJob(data.jobId);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Generation failed");
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-start">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex w-full justify-center pb-2 pt-8">
        <Image src="/assets/moonxbt.png" alt="MoonXBT" width={40} height={40} className="rounded-full" />
      </div>

      <div
        className="relative z-10 flex w-full justify-center overflow-y-auto px-4 sm:px-8 md:px-12"
        style={{ maxHeight: "95vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="relative mx-auto w-full max-w-3xl border border-white/50 bg-[#f1e4ee]/95 p-6 text-[#1e1730] shadow-2xl sm:p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-white/25 text-4xl font-extrabold text-white shadow-xl backdrop-blur hover:bg-white/35 sm:h-16 sm:w-16 sm:text-5xl"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex flex-col items-center gap-1 pb-2 pt-6">
            <h1 className="text-center font-sora text-2xl font-extrabold leading-tight tracking-tight text-[#0f0f16] antialiased sm:text-3xl">
              Bid for MoonXBT&apos;s Next Video
            </h1>
          </div>

          <Separator className="mb-3 bg-white/40" />

          <div className="mb-5 rounded-2xl border border-white/55 bg-white/40 p-3 sm:p-4">
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex h-fit w-full flex-col gap-3 text-center lg:text-left">
                <div className="rounded-lg bg-white/65 px-3 py-2">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#222238]">
                    <FaTrophy className="text-sm text-primary" />
                    Last Auction Winner
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#4d4668]">
                    Auction #{lastAuctionIdLabel}
                  </p>
                </div>

                <div className="rounded-lg bg-white/65 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4d4668]">
                    Winner Wallet
                  </p>
                  <p className="mt-1 font-mono text-base text-[#1c1c2e]">
                    {lastAuctionWinner
                      ? `${lastAuctionWinner.slice(0, 6)}...${lastAuctionWinner.slice(-4)}`
                      : "0x0000...0000"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#3a3a55]">
                    Bid: {lastAuctionAmount !== undefined ? formatUnits(lastAuctionAmount, 6) : "0"} USDC
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  <div className="flex flex-col items-center rounded-lg bg-white/65 px-3 py-2 lg:items-start">
                    <span className="font-sora text-2xl font-bold tracking-tight text-[#1c1c2e]">
                      {isLoadingAuctionData ? "..." : formattedTimeLeft}
                    </span>
                    <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-[#3a3a55]">
                      Time left
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white/65 px-3 py-2 lg:items-start">
                    <span className="font-sora text-2xl font-bold tracking-tight text-[#1c1c2e]">
                      {isLoadingAuctionData ? "..." : formattedBidAmount}
                    </span>
                    <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-[#3a3a55]">
                      Current Bid
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-white/40 bg-black/10">
                <video
                  src={parsedLastAuctionResourceValue?.url || "/assets/moonxbtauction.mp4"}
                  controls
                  className="h-auto max-h-[360px] w-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          <Tabs
            value={String(activeStep)}
            onValueChange={(value) => {
              if (value === "1") {
                setActiveStep(1);
                return;
              }
              if (value === "2" && canAccessStep2) {
                setActiveStep(2);
              }
            }}
            className="mb-2"
          >
            <TabsList className="mx-auto mb-4 flex h-auto w-full max-w-xl gap-2 rounded-xl border border-white/40 bg-white/50 p-1">
              <TabsTrigger
                value="1"
                className="flex-1 rounded-lg px-4 py-2 text-xs font-semibold text-[#2a2242] data-[state=active]:bg-[#1f1a31] data-[state=active]:text-white"
              >
                Step 1: Pay
              </TabsTrigger>
              <TabsTrigger
                value="2"
                disabled={!canAccessStep2}
                className="flex-1 rounded-lg px-4 py-2 text-xs font-semibold text-[#2a2242] data-[state=active]:bg-[#1f1a31] data-[state=active]:text-white"
              >
                Step 2: Configure + Generate {!canAccessStep2 ? "(locked)" : ""}
              </TabsTrigger>
            </TabsList>

            {LOCAL_DEBUG_STEP2_BYPASS && (
              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Local debug mode active: Step 2 is unlocked without payment. Remove
                NEXT_PUBLIC_LOCAL_DEBUG_STEP2_BYPASS before deploy.
              </div>
            )}

            <TabsContent value="1" className="m-0 rounded-xl border border-[#ff4fb2]/35 bg-[#ff4fb2]/12 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#2a2242]">Step 1: Payment (Required)</h3>

                {wallet?.address ? (
                  <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-emerald-300/70 bg-emerald-50 px-2 shadow-sm">
                    <FaWallet className="text-[11px] text-emerald-700" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-700">Wallet</span>
                    <span className="font-mono text-[11px] text-emerald-950">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900">
                      {formattedBalanceUSDC}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">USDC</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleDisconnect}
                      title="Disconnect"
                      aria-label="Disconnect wallet"
                      className="h-6 w-6 rounded-full border border-emerald-300/80 bg-white text-emerald-800 hover:bg-emerald-100"
                    >
                      <FaSignOutAlt className="text-xs" />
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mb-3 flex w-full flex-row items-center gap-3">
                <Input
                  id="bid-amount"
                  type="number"
                  placeholder="Enter your USDC bid"
                  value={rawBidAmountInput}
                  onChange={(e) => setRawBidAmountInput(e.target.value)}
                  className="min-h-[36px] flex-1 w-full bg-white text-[#1f1a31] placeholder:text-[#7b718f]"
                  min="0"
                  step="0.01"
                  disabled={isAnyPending}
                />
                <Button
                  type="button"
                  onClick={handleStep1Action}
                  className="h-[42px] w-auto min-w-[150px] gap-2 border border-black/20 bg-[#f4d20b] text-sm font-bold text-black hover:bg-[#ffd700]"
                  disabled={
                    (!wallet?.address && !ready) ||
                    isAnyPending ||
                    isLoadingAllowance ||
                    (wallet?.address ? !isBidInputValid : false)
                  }
                >
                  {step1ButtonLabel}
                </Button>
              </div>

              <Input
                id="resource-url"
                type="url"
                placeholder="Resource URL (required for bid metadata)"
                value={rawResourceUrlInput}
                onChange={(e) => setRawResourceUrlInput(e.target.value)}
                className={`${urlError ? "ring-2 ring-red-400" : ""} mb-3 bg-white text-[#1f1a31] placeholder:text-[#7b718f]`}
                disabled={isAnyPending}
              />

              <Textarea
                id="metadata"
                placeholder="Metadata (optional)"
                value={rawResourceMetadataInput}
                onChange={(e) => setRawResourceMetadataInput(e.target.value)}
                rows={2}
                className="bg-white text-[#1f1a31] placeholder:text-[#7b718f]"
                disabled={isAnyPending}
              />

              {urlError && <p className="pt-2 text-xs text-red-500">{urlError}</p>}
              {(isBidError || isSimulationError) && (
                <p className="pt-2 text-xs text-red-500">
                  {(bidError as Error)?.message || (simulationError as Error)?.message || "Transaction failed"}
                </p>
              )}
              {isBidSuccess && (
                <p className="pt-2 text-xs text-green-700">
                  Payment confirmed. Step 2 unlocked.
                </p>
              )}
            </TabsContent>

            <TabsContent value="2" className="m-0 max-h-[46vh] overflow-y-auto rounded-2xl border border-white/55 bg-gradient-to-b from-white/72 to-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm">
              <h3 className="mb-2 text-sm font-semibold text-[#2a2242]">Step 2: Video Script + Generation</h3>
              {!canAccessStep2 && (
                <p className="mb-3 text-xs text-[#2f2f46]">
                  Complete Step 1 payment first. Once paid, this section unlocks automatically.
                </p>
              )}

              <div className="mb-3 space-y-3">
                <Textarea
                  rows={3}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe your project/script idea for MoonXBT..."
                  className="bg-white text-[#1f1a31] placeholder:text-[#7b718f]"
                  disabled={!canAccessStep2 || isGenerating}
                />

                <TooltipProvider>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0 sm:items-start">
                    <div>
                      <div className="mb-2 flex items-center gap-1">
                        <p className="text-xs font-medium text-[#3a3152]">Tone</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-transparent"
                              aria-label="Tone info"
                              title="Tone info"
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#bcb5cf] bg-white text-[10px] font-bold text-[#3a3152]">
                                i
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[180px] text-xs">{CONTROL_HINTS.tone}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TONES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setTone(t.value)}
                            disabled={!canAccessStep2 || isGenerating}
                            className={`rounded-full border px-3 py-1 text-xs ${tone === t.value ? "border-[#1f1a31] bg-[#1f1a31] text-white" : "border-gray-300 bg-white text-[#2f2a45]"}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:px-5">
                      <div className="rounded-lg border border-white/50 bg-white/75 px-3 py-2">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-medium text-[#3a3152]">Hype</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-transparent"
                                  aria-label="Hype info"
                                  title="Hype info"
                                >
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#bcb5cf] bg-white text-[10px] font-bold text-[#3a3152]">
                                    i
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[180px] text-xs">{CONTROL_HINTS.hype}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-[11px] font-semibold text-[#2f2a45]">{hypePercent}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={hypePercent}
                          onChange={(e) => setHypePercent(Number(e.target.value))}
                          disabled={!canAccessStep2 || isGenerating}
                          className="h-1.5 w-full accent-[#1f1a31]"
                          aria-label="Hype"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-1">
                        <p className="text-xs font-medium text-[#3a3152]">Mood</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-transparent"
                              aria-label="Mood info"
                              title="Mood info"
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#bcb5cf] bg-white text-[10px] font-bold text-[#3a3152]">
                                i
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[180px] text-xs">{CONTROL_HINTS.mood}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MOODS.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMood(m.value)}
                            disabled={!canAccessStep2 || isGenerating}
                            className={`rounded-full border px-3 py-1 text-xs ${mood === m.value ? "border-[#1f1a31] bg-[#1f1a31] text-white" : "border-gray-300 bg-white text-[#2f2a45]"}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TooltipProvider>
              </div>

              <div className="mb-1 mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={!canAccessStep2 || !jobId || isGenerating}
                  className="border-[#b8b2cf] bg-white text-[#1f1f33] hover:bg-[#f6f3ff]"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="border border-black/20 bg-[#ff4fb2] text-white hover:bg-[#ff63bd]"
                >
                  {isGenerating ? "Generating..." : "Accept & Generate Video"}
                </Button>
              </div>

              {generationError && <p className="mb-2 text-xs text-red-500">{generationError}</p>}

              {jobId && (
                <div className="mb-2 text-xs text-[#3f3759]">
                  Job: <span className="font-mono">{jobId.slice(0, 16)}...</span> | Status: {jobStatus || "pending"}
                </div>
              )}

              {scriptUsed && (
                <div className="mb-3 rounded-md border border-[#ddd7f5] bg-white p-2 text-xs text-[#2a2242]">
                  <p className="mb-1 font-semibold">Generated script:</p>
                  <p className="whitespace-pre-wrap">{scriptUsed}</p>
                </div>
              )}

              {previewUrl && (
                <div className="rounded-lg border border-[#ddd7f5] bg-white p-3">
                  <p className="mb-2 text-xs font-semibold text-[#2a2242]">Preview (FFmpeg watermarked)</p>
                  <video src={previewUrl} controls className="max-h-64 w-full rounded-md object-cover" />
                  <p className="mt-2 text-[11px] text-[#5a5376]">
                    If you don&apos;t like this preview, edit your prompt/tone and click Regenerate.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

        </Card>
      </div>
    </div>
  );
}
