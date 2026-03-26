"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlayCircle, FaSignOutAlt, FaSpinner, FaTrophy, FaWallet } from "react-icons/fa";
import { erc20Abi, formatUnits, maxUint256, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { useDisconnect, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";

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

type AuctionEntryResponse = {
  success?: boolean;
  entry?: {
    maxBid?: string | null;
    currentJob?: {
      jobId?: string | null;
      status?: string | null;
    };
    latestVideo?: {
      jobId?: string | null;
      scriptUsed?: string | null;
      previewPublicUrl?: string | null;
      previewBucket?: string | null;
      previewPath?: string | null;
    };
    project?: {
      url?: string | null;
      description?: string | null;
    };
  };
};

function normalizeJobStatus(status: unknown): JobStatus {
  if (status === "complete" || status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "processing") return "processing";
  return "pending";
}

function resolvePreviewUrl(job: Record<string, unknown>, jobId?: string | null): string | null {
  if (
    jobId &&
    typeof job.previewPath === "string" &&
    job.previewPath.trim()
  ) {
    return `/api/moonxbt/video/${jobId}/stream`;
  }
  if (typeof job.videoUrl === "string" && job.videoUrl.trim()) {
    return job.videoUrl;
  }
  if (typeof job.previewPublicUrl === "string" && job.previewPublicUrl.trim()) {
    return job.previewPublicUrl;
  }
  if (
    typeof job.previewBucket === "string" &&
    job.previewBucket.trim() &&
    typeof job.previewPath === "string" &&
    job.previewPath.trim()
  ) {
    return `https://storage.googleapis.com/${job.previewBucket}/${job.previewPath}`;
  }
  return null;
}

async function readJsonSafe(response: Response): Promise<Record<string, unknown>> {
  const raw = await response.text();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {
      error: `Non-JSON response (${response.status}): ${raw.slice(0, 180)}`,
    };
  }
}

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

function getReadableBidError(error: unknown): string {
  const message = (error as Error | undefined)?.message || "Transaction failed";

  if (message.includes("0xfb8f41b2") || message.includes("ERC20InsufficientAllowance")) {
    return "Insufficient allowance for MXBT. Click Approve MXBT again and wait for confirmation.";
  }
  if (message.includes("Bid value too low")) {
    return "Your bid must be higher than the current highest bid.";
  }
  if (message.includes("Auction has ended")) {
    return "This auction already ended. Wait for the next auction round.";
  }
  if (message.includes("Token not allowed")) {
    return "This token is not enabled for bidding in the current auction.";
  }
  if (message.includes("Token price not set")) {
    return "Token price is not configured on-chain yet. Please try again shortly.";
  }

  return "Transaction failed. Please retry after confirming wallet network and approval.";
}

function getReadableApprovalError(error: unknown): string {
  const message = ((error as Error | undefined)?.message || "").toLowerCase();
  const code =
    (error as { code?: unknown } | undefined)?.code ||
    (error as { cause?: { code?: unknown } } | undefined)?.cause?.code;

  if (code === 4001 || message.includes("user rejected") || message.includes("rejected")) {
    return "Approval was rejected in wallet. Please retry and confirm the transaction.";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient gas funds in wallet for approval transaction.";
  }
  if (message.includes("wrong network") || message.includes("chain") || message.includes("base sepolia")) {
    return "Wrong network detected. Switch wallet to Base Sepolia and retry.";
  }
  if (message.includes("cannot read from private field")) {
    return "Wallet provider conflict detected (usually extension injection). Try incognito with one wallet extension enabled.";
  }

  return "Approval failed. Please retry and confirm in wallet.";
}

function stringifyErrorForDebug(error: unknown): string {
  if (!error) return "unknown error";
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

const LOCAL_DEBUG_STEP2_BYPASS =
  process.env.NEXT_PUBLIC_LOCAL_DEBUG_STEP2_BYPASS === "true";
const AUCTION_DEBUG = process.env.NEXT_PUBLIC_MOONXBT_DEBUG === "true";

export function VideoAuctionSheet({ isOpen, onClose }: VideoAuctionSheetProps) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const autoTriggeredStep2Ref = useRef(false);
  const completedPreviewShownForJobRef = useRef<string | null>(null);
  const leadingBidToastShownRef = useRef<string | null>(null);

  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const [rawBidAmountInput, setRawBidAmountInput] = useState("");
  const [rawResourceUrlInput, setRawResourceUrlInput] = useState("");
  const [rawResourceMetadataInput, setRawResourceMetadataInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isEnsuringAuctionOpen, setIsEnsuringAuctionOpen] = useState(false);

  const [tone, setTone] = useState<Tone>("balanced");
  const [hypePercent, setHypePercent] = useState(60);
  const [mood, setMood] = useState<Mood>("sassy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isJobRecoverable, setIsJobRecoverable] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scriptUsed, setScriptUsed] = useState<string | null>(null);
  const [showCompletedPreviewModal, setShowCompletedPreviewModal] = useState(false);
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] = useState(false);
  const [isHydratingDraft, setIsHydratingDraft] = useState(false);

  const {
    currentAuctionId,
    currentBidder,
    currentBidAmount,
    formattedTimeLeft,
    formattedBidAmount,
    isLoading: isLoadingAuctionData,
    lastAuctionWinner,
    lastAuctionAmount,
    lastAuctionResourceValue,
    refetchAuctionData,
    refetchBid,
  } = useAuctionData();

  const isAuctionExpired =
    !isLoadingAuctionData && formattedTimeLeft === "00:00:00";

  const bidAmountUnits = useMemo(() => {
    try {
      return parseUnits(rawBidAmountInput || "0", 18);
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
    chainId: baseSepolia.id,
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
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(wallet?.address),
    },
  });

  const allowance = (allowanceData as bigint | undefined) ?? BigInt(0);
  const hasAllowance = allowance > BigInt(0);
  const isApproved = bidAmountUnits > BigInt(0) && allowance >= bidAmountUnits;
  const needsIncreaseApproval = bidAmountUnits > BigInt(0) && hasAllowance && allowance < bidAmountUnits;
  const needsApproval = bidAmountUnits > BigInt(0) && allowance < bidAmountUnits;

  const {
    write: writeApprove,
    isLoading: isConfirmingApproval,
    isPromptingWallet: isPromptingApproveWallet,
    isWaitingApprovalConfirmation,
    isApprovalSuccess,
    approvalError,
  } = useApprove(
    USDC_CONTRACT_ADDRESS,
    "MXBT",
    AUCTION_CONTRACT_ADDRESS,
    needsApproval,
    bidAmountUnits,
    async () => {
      await refetchAllowance();
    }
  );

  const revokeWrite = useWriteContract();
  const revokeWait = useWaitForTransactionReceipt({
    hash: revokeWrite.data,
    query: {
      enabled: !!revokeWrite.data,
    },
  });

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
      autoTriggeredStep2Ref.current = false;
      setJobId(null);
      setJobStatus(null);
      setPreviewUrl(null);
      setScriptUsed(null);
      setGenerationError(null);
      setActiveStep(2);
      await Promise.all([
        refetchAllowance(),
        refetchBalanceUSDC(),
        refetchAuctionData(),
        refetchBid(),
      ]);
    },
    { tokenDecimals: 18, tokenSymbol: "MXBT", simulateEnabled: isApproved }
  );

  const readableBidError = useMemo(() => getReadableBidError(bidError), [bidError]);
  const readableApprovalError = useMemo(
    () => getReadableApprovalError(approvalError),
    [approvalError]
  );
  const readableSimulationError = useMemo(
    () => getReadableBidError(simulationError),
    [simulationError]
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

  const formattedBalanceUSDC = Number(formatUnits(balanceUSDC || BigInt(0), 18)).toFixed(2);
  const formattedAllowance = useMemo(() => {
    if (allowance === maxUint256) return "Unlimited";
    return Number(formatUnits(allowance, 18)).toFixed(2);
  }, [allowance]);

  const isBidInputValid =
    rawBidAmountInput.trim().length > 0 &&
    Number(rawBidAmountInput) > 0 &&
    rawResourceUrlInput.trim().length > 0;

  const isApproveInputValid =
    rawBidAmountInput.trim().length > 0 && Number(rawBidAmountInput) > 0;

  const isApprovalFlowPending =
    isApproving || isConfirmingApproval || isPromptingApproveWallet || isWaitingApprovalConfirmation;
  const isBidFlowPending = isPromptingWallet || isWaitingForConfirmation;
  const isRevokePending = revokeWrite.isPending || revokeWait.isLoading;

  const isAnyPending =
    isApprovalFlowPending ||
    isBidFlowPending ||
    isRevokePending ||
    isEnsuringAuctionOpen;

  const normalizedWalletAddress = wallet?.address?.toLowerCase();
  const auctionEntryId = useMemo(() => {
    if (!currentAuctionId || !normalizedWalletAddress) return null;
    return `auction-${currentAuctionId.toString()}-${normalizedWalletAddress}`;
  }, [currentAuctionId, normalizedWalletAddress]);
  const isCurrentUserLeadingBidder = Boolean(
    normalizedWalletAddress &&
      currentBidder &&
      currentBidder.toLowerCase() === normalizedWalletAddress &&
      (currentBidAmount ?? BigInt(0)) > BigInt(0)
  );

  const canSubmitBid = Boolean(wallet?.address && isBidInputValid && !isAnyPending && !isLoadingAllowance && !isSimulating);
  const canApproveAmount = Boolean(wallet?.address && isApproveInputValid && !isAnyPending && !isLoadingAllowance);
  const canAccessStep2 = LOCAL_DEBUG_STEP2_BYPASS || isCurrentUserLeadingBidder;
  const isJobRunning =
    isGenerating || jobStatus === "pending" || jobStatus === "processing";
  const stepperStage = useMemo<"start" | "processing" | "done">(() => {
    if (jobStatus === "completed") return "done";
    if (jobStatus === "pending" || jobStatus === "processing" || jobStatus === "failed") {
      return "processing";
    }
    return "start";
  }, [jobStatus]);

  const isStepStartCurrent = stepperStage === "start";
  const isStepStartDone = stepperStage !== "start";

  const isStepProcessingCurrent = stepperStage === "processing";
  const isStepProcessingDone = stepperStage === "done";

  const isStepDoneCurrent = stepperStage === "done";
  const isStepDone = stepperStage === "done";
  const showStep2Controls = canAccessStep2 && !isJobRunning;

  const step1ButtonLabel = !wallet?.address
    ? "Connect Wallet"
    : isEnsuringAuctionOpen
    ? "Finalizing Auction..."
    : needsApproval
    ? isApprovalFlowPending
      ? needsIncreaseApproval
        ? "Increasing Approval..."
        : "Approving MXBT..."
      : needsIncreaseApproval
      ? "Increase Approval"
      : "Approve MXBT"
    : isBidFlowPending
    ? "Placing Bid..."
    : isSimulating
    ? "Simulating..."
    : "Pay & Continue";

  const effectivePrompt = useMemo(() => {
    const description = rawResourceMetadataInput.trim();
    const url = rawResourceUrlInput.trim();

    if (description && url) {
      return `${description}\n\nProject URL: ${url}`;
    }
    if (description) return description;
    if (url) {
      return `Create a short promo video for this project URL: ${url}`;
    }
    return "";
  }, [rawResourceMetadataInput, rawResourceUrlInput]);

  const canGenerate = canAccessStep2 && effectivePrompt.length > 0 && !isJobRunning;
  const normalizedEnthusiasmLevel = useMemo(
    () => Math.max(1, Math.min(5, Math.round(hypePercent / 25) + 1)),
    [hypePercent]
  );

  const handleDisconnect = async () => {
    await logout();
    disconnect();
    setActiveStep(1);
  };

  const hydrateDraftFromBackend = async () => {
    if (!auctionEntryId) return;

    try {
      setIsHydratingDraft(true);
      const res = await fetch(`/api/moonxbt/auction/entry/${auctionEntryId}`, {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as AuctionEntryResponse;
      const storedBid = data?.entry?.maxBid?.toString() || "";
      const storedUrl = data?.entry?.project?.url || "";
      const storedDescription = data?.entry?.project?.description || "";
      const currentJobId = data?.entry?.currentJob?.jobId || null;
      const currentJobStatus = data?.entry?.currentJob?.status || null;
      const latestJobId = data?.entry?.latestVideo?.jobId || null;
      const latestScript = data?.entry?.latestVideo?.scriptUsed || null;
      const latestPreviewPublicUrl = data?.entry?.latestVideo?.previewPublicUrl || null;
      const latestPreviewBucket = data?.entry?.latestVideo?.previewBucket || null;
      const latestPreviewPath = data?.entry?.latestVideo?.previewPath || null;

      if (storedBid) setRawBidAmountInput(storedBid);
      if (storedUrl) setRawResourceUrlInput(storedUrl);
      if (storedDescription) setRawResourceMetadataInput(storedDescription);

      if (currentJobId && (currentJobStatus === "pending" || currentJobStatus === "processing")) {
        setJobId(currentJobId);
        setJobStatus(normalizeJobStatus(currentJobStatus));
        setIsGenerating(currentJobStatus === "pending" || currentJobStatus === "processing");
        pollJob(currentJobId);
        return;
      }

      if (latestJobId) {
        setJobId(latestJobId);
        setJobStatus("completed");
        if (latestScript) setScriptUsed(latestScript);
        if (latestJobId) {
          setPreviewUrl(`/api/moonxbt/video/${latestJobId}/stream`);
        } else if (latestPreviewPublicUrl) {
          setPreviewUrl(latestPreviewPublicUrl);
        } else if (latestPreviewBucket && latestPreviewPath) {
          setPreviewUrl(`https://storage.googleapis.com/${latestPreviewBucket}/${latestPreviewPath}`);
        }
      }
    } finally {
      setIsHydratingDraft(false);
    }
  };

  const persistDraftToBackend = async () => {
    if (!auctionEntryId || !normalizedWalletAddress || currentAuctionId == null) return;

    await fetch(`/api/moonxbt/auction/entry/${auctionEntryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionId: currentAuctionId.toString(),
        userAddress: normalizedWalletAddress,
        maxBid: rawBidAmountInput || null,
        projectUrl: rawResourceUrlInput || null,
        projectDescription: rawResourceMetadataInput || null,
      }),
    });
  };

  useEffect(() => {
    const storedBidAmount = localStorage.getItem("moonxbt-bid-amount");
    const storedUrl = localStorage.getItem("moonxbt-resource-url");
    const storedMetadata = localStorage.getItem("moonxbt-resource-metadata");

    if (storedBidAmount) setRawBidAmountInput(storedBidAmount);
    if (storedUrl) setRawResourceUrlInput(storedUrl);
    if (storedMetadata) setRawResourceMetadataInput(storedMetadata);
  }, []);

  useEffect(() => {
    localStorage.setItem("moonxbt-bid-amount", rawBidAmountInput);
  }, [rawBidAmountInput]);

  useEffect(() => {
    localStorage.setItem("moonxbt-resource-url", rawResourceUrlInput);
  }, [rawResourceUrlInput]);

  useEffect(() => {
    localStorage.setItem("moonxbt-resource-metadata", rawResourceMetadataInput);
  }, [rawResourceMetadataInput]);

  useEffect(() => {
    if (!isOpen || !auctionEntryId) return;
    void hydrateDraftFromBackend();
  }, [isOpen, auctionEntryId]);

  useEffect(() => {
    if (!auctionEntryId || isHydratingDraft) return;

    const timeout = setTimeout(() => {
      void persistDraftToBackend();
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    auctionEntryId,
    currentAuctionId,
    normalizedWalletAddress,
    rawBidAmountInput,
    rawResourceUrlInput,
    rawResourceMetadataInput,
    isHydratingDraft,
  ]);

  const handleApproveClick = async () => {
    if (!wallet?.address) return;
    if (bidAmountUnits <= BigInt(0)) {
      toast.error("Enter a bid amount greater than 0 before approving.");
      return;
    }
    try {
      setIsApproving(true);
      await wallet.switchChain(baseSepolia.id);
      writeApprove.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [AUCTION_CONTRACT_ADDRESS, bidAmountUnits],
        chainId: baseSepolia.id,
      });
    } catch (error) {
      console.error("[MoonXBT][Approve] Failed before tx submission", {
        error: stringifyErrorForDebug(error),
        wallet: wallet?.address,
        chainId: wallet?.chainId,
        expectedChainId: baseSepolia.id,
        bidAmountInput: rawBidAmountInput,
        bidAmountUnits: bidAmountUnits.toString(),
      });
      toast.error(getReadableApprovalError(error));
    } finally {
      setIsApproving(false);
    }
  };

  const ensureAuctionOpen = async () => {
    setIsEnsuringAuctionOpen(true);
    try {
      const res = await fetch("/api/moonxbt/auction/ensure-open", {
        method: "POST",
        cache: "no-store",
      });
      const data = await readJsonSafe(res);

      if (!res.ok || !data?.success) {
        const message =
          (typeof data?.error === "string" && data.error) ||
          `Failed to finalize auction (${res.status})`;
        throw new Error(message);
      }

      if (data.finalized) {
        toast.success("Auction finalized. New round is open.");
        await Promise.all([
          refetchAuctionData(),
          refetchBid(),
          refetchAllowance(),
          refetchBalanceUSDC(),
        ]);
      }

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to ensure auction is open"
      );
      return false;
    } finally {
      setIsEnsuringAuctionOpen(false);
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
    const isOpen = await ensureAuctionOpen();
    if (!isOpen) return;
    await wallet.switchChain(baseSepolia.id);
    placeBid();
  };

  const handleStep1Action = async () => {
    if (!wallet?.address) {
      login();
      return;
    }
    if (needsApproval) {
      await handleApproveClick();
      return;
    }
    await handleBidSubmit();
  };

  const handleRevokeClick = async () => {
    if (!wallet?.address || !hasAllowance) return;

    try {
      await wallet.switchChain(baseSepolia.id);
      revokeWrite.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [AUCTION_CONTRACT_ADDRESS, BigInt(0)],
        chainId: baseSepolia.id,
      });
    } catch {
      toast.error("Revoke failed. Please retry and confirm in wallet.");
    }
  };

  useEffect(() => {
    if (!isApprovalSuccess) return;

    toast.success(
      needsApproval
        ? "Approval confirmed. Increase if needed or continue to pay."
        : "Approval confirmed. You can now click Pay & Continue."
    );
    void Promise.all([refetchAllowance(), refetchBalanceUSDC()]);
  }, [isApprovalSuccess, needsApproval, refetchAllowance, refetchBalanceUSDC]);

  useEffect(() => {
    if (!revokeWait.isSuccess) return;

    toast.success("Allowance revoked to 0 MXBT.");
    void Promise.all([refetchAllowance(), refetchBalanceUSDC()]);
  }, [revokeWait.isSuccess, refetchAllowance, refetchBalanceUSDC]);

  useEffect(() => {
    if (!isBidSuccess) return;

    toast.success("Bid transaction confirmed. Checking if you are the current top bid...");
  }, [isBidSuccess]);

  useEffect(() => {
    if (!approvalError) return;

    console.error("[MoonXBT][Approve] Approval error", {
      error: stringifyErrorForDebug(approvalError),
      wallet: wallet?.address,
      chainId: wallet?.chainId,
      expectedChainId: baseSepolia.id,
      bidAmountInput: rawBidAmountInput,
      bidAmountUnits: bidAmountUnits.toString(),
      allowance: allowance.toString(),
      needsApproval,
    });
  }, [
    approvalError,
    wallet?.address,
    wallet?.chainId,
    rawBidAmountInput,
    bidAmountUnits,
    allowance,
    needsApproval,
  ]);

  useEffect(() => {
    if (!isSimulationError || !simulationError) return;

    console.error("[MoonXBT][Bid] Simulation error", {
      error: stringifyErrorForDebug(simulationError),
      wallet: wallet?.address,
      chainId: wallet?.chainId,
      expectedChainId: baseSepolia.id,
      bidAmountInput: rawBidAmountInput,
      bidAmountUnits: bidAmountUnits.toString(),
      resourceUrl: rawResourceUrlInput,
      resourceMetadataLength: rawResourceMetadataInput.length,
      isApproved,
      allowance: allowance.toString(),
    });
  }, [
    isSimulationError,
    simulationError,
    wallet?.address,
    wallet?.chainId,
    rawBidAmountInput,
    bidAmountUnits,
    rawResourceUrlInput,
    rawResourceMetadataInput,
    isApproved,
    allowance,
  ]);

  useEffect(() => {
    if (!isBidError || !bidError) return;

    console.error("[MoonXBT][Bid] Transaction error", {
      error: stringifyErrorForDebug(bidError),
      wallet: wallet?.address,
      chainId: wallet?.chainId,
      expectedChainId: baseSepolia.id,
      bidAmountInput: rawBidAmountInput,
      bidAmountUnits: bidAmountUnits.toString(),
      allowance: allowance.toString(),
      currentAuctionId: currentAuctionId?.toString(),
    });
  }, [
    isBidError,
    bidError,
    wallet?.address,
    wallet?.chainId,
    rawBidAmountInput,
    bidAmountUnits,
    allowance,
    currentAuctionId,
  ]);

  useEffect(() => {
    if (!AUCTION_DEBUG) return;
    if (!wallet?.address) return;

    console.info("[MoonXBT][Debug] wallet+auction snapshot", {
      wallet: wallet.address,
      chainId: wallet.chainId,
      expectedChainId: baseSepolia.id,
      currentAuctionId: currentAuctionId?.toString(),
      formattedTimeLeft,
      isAuctionExpired,
      bidAmountInput: rawBidAmountInput,
      bidAmountUnits: bidAmountUnits.toString(),
      allowance: allowance.toString(),
      needsApproval,
      isApproved,
      canSubmitBid,
    });
  }, [
    wallet?.address,
    wallet?.chainId,
    currentAuctionId,
    formattedTimeLeft,
    isAuctionExpired,
    rawBidAmountInput,
    bidAmountUnits,
    allowance,
    needsApproval,
    isApproved,
    canSubmitBid,
  ]);

  useEffect(() => {
    if (!isCurrentUserLeadingBidder || !currentAuctionId) return;

    const toastKey = `${currentAuctionId.toString()}-${normalizedWalletAddress || "unknown"}`;
    if (leadingBidToastShownRef.current === toastKey) return;

    leadingBidToastShownRef.current = toastKey;
    toast.success("Your bid is now leading. Step 2 unlocked.");
  }, [isCurrentUserLeadingBidder, currentAuctionId, normalizedWalletAddress]);

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
        const data = await readJsonSafe(res);
        if (!res.ok || !data?.job) {
          throw new Error(
            (typeof data?.error === "string" && data.error) ||
              `Failed to fetch job status (${res.status})`
          );
        }

        const job = data.job as Record<string, unknown>;
        const status = normalizeJobStatus(job.status);
        setJobStatus(status);
        setIsJobRecoverable(Boolean(job.recoverable));
        if (typeof job.scriptUsed === "string") setScriptUsed(job.scriptUsed);
        const resolvedPreviewUrl = resolvePreviewUrl(job, newJobId);
        if (resolvedPreviewUrl) setPreviewUrl(resolvedPreviewUrl);
        if (status === "failed" && typeof job.error === "string" && job.error.trim()) {
          setGenerationError(job.error);
        }

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

  const handleGenerate = async ({ auto = false }: { auto?: boolean } = {}) => {
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
          userPrompt: effectivePrompt,
          auctionEntryId,
          userAddress: normalizedWalletAddress,
          maxBid: rawBidAmountInput,
          projectUrl: rawResourceUrlInput,
          projectDescription: rawResourceMetadataInput,
          tone,
            enthusiasmLevel: normalizedEnthusiasmLevel,
            hypePercent,
          mood,
            forceRegenerate: !auto,
          durationSeconds: 8,
          aspectRatio: "9:16",
        }),
      });

      const data = await readJsonSafe(res);
      const jobIdFromResponse =
        typeof data?.jobId === "string" ? data.jobId : null;
      if (!res.ok || !jobIdFromResponse) {
        throw new Error(
          (typeof data?.error === "string" && data.error) ||
            `Failed to start generation (${res.status})`
        );
      }

      if (!auto) {
        toast.success("Video generation started.");
      }
      setJobId(jobIdFromResponse);
      if (typeof data.scriptUsed === "string") setScriptUsed(data.scriptUsed);
      pollJob(jobIdFromResponse);
    } catch (error) {
      toast.error("Failed to start video generation.");
      setGenerationError(error instanceof Error ? error.message : "Generation failed");
      setIsGenerating(false);
    }
  };

  const handleRegenerateClick = () => {
    if (!canGenerate) return;

    if (previewUrl) {
      setShowRegenerateConfirmModal(true);
      return;
    }

    void handleGenerate();
  };

  const handleConfirmRegenerate = () => {
    setShowRegenerateConfirmModal(false);
    setShowCompletedPreviewModal(false);
    completedPreviewShownForJobRef.current = null;
    void handleGenerate();
  };

  const handleRecoverJob = async () => {
    if (!jobId) return;

    setGenerationError(null);
    setIsGenerating(true);
    setJobStatus("processing");
    setIsJobRecoverable(false);

    try {
      const res = await fetch(`/api/moonxbt/video/${jobId}/recover`, {
        method: "POST",
      });
      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          (typeof data?.error === "string" && data.error) ||
            `Failed to resume job (${res.status})`
        );
      }

      toast.success("Recovery started. Reusing generated scene assets.");
      pollJob(jobId);
    } catch (error) {
      setIsGenerating(false);
      setGenerationError(error instanceof Error ? error.message : "Recovery failed");
      toast.error("Failed to resume job.");
    }
  };

  useEffect(() => {
    if (!canAccessStep2 || activeStep !== 2) return;
    if (autoTriggeredStep2Ref.current) return;
    if (jobId || isJobRunning) return;
    if (!rawResourceUrlInput.trim()) return;

    autoTriggeredStep2Ref.current = true;
    void handleGenerate({ auto: true });
  }, [
    activeStep,
    canAccessStep2,
    jobId,
    isJobRunning,
    rawResourceUrlInput,
  ]);

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

          <div
            className={`overflow-hidden transition-all duration-500 ${
              activeStep === 2
                ? "mb-0 max-h-0 opacity-0"
                : "mb-5 max-h-[520px] opacity-100"
            }`}
          >
            <div className="rounded-2xl border border-white/55 bg-white/40 p-3 sm:p-4">
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[250px_170px_minmax(0,500px)] lg:items-start lg:gap-5">
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
                    Bid: {lastAuctionAmount !== undefined ? formatUnits(lastAuctionAmount, 18) : "0"} MXBT
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:content-start">
                <div className="flex flex-col items-center rounded-lg bg-white/65 px-3 py-2 lg:items-start">
                  <span className="font-sora text-2xl font-bold tracking-tight text-[#1c1c2e]">
                    {isLoadingAuctionData ? "..." : formattedTimeLeft}
                  </span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-[#3a3a55]">
                    Time left
                  </span>
                  {isAuctionExpired && (
                    <span className="mt-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-700">
                      Auction ended - needs finalize
                    </span>
                  )}
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

              <div
                className="relative w-full overflow-hidden rounded-xl border border-white/40 bg-black/10"
              >
                <video
                  src={parsedLastAuctionResourceValue?.url || "/assets/moonxbtauction.mp4"}
                  controls
                  className="h-auto w-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
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

            <TabsContent value="1" className="m-0">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#2a2242]">Step 1: Place Leading Bid (Required)</h3>

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
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">MXBT</span>
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
                  placeholder="Enter your MXBT bid"
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
                    (wallet?.address ? needsApproval ? !canApproveAmount : !isBidInputValid : false)
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

              {wallet?.address && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <span>
                    Allowance: <span className="font-semibold">{formattedAllowance} MXBT</span>
                  </span>
                  {hasAllowance && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRevokeClick}
                      disabled={isAnyPending}
                      className="h-7 border-red-300 bg-white px-2 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      {isRevokePending ? "Revoking..." : "Revoke"}
                    </Button>
                  )}
                </div>
              )}

              {urlError && <p className="pt-2 text-xs text-red-500">{urlError}</p>}
              {approvalError && !isApprovalSuccess && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <p>{readableApprovalError}</p>
                  <p className="mt-1 break-all text-[10px] text-red-600/90">
                    Debug: {stringifyErrorForDebug(approvalError).slice(0, 220)}
                  </p>
                </div>
              )}
              {isBidError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {readableBidError}
                </div>
              )}
              {isSimulationError && isApproved && !isBidError && (
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {readableSimulationError}
                </div>
              )}
              {isBidSuccess && (
                <p className="pt-2 text-xs text-green-700">
                  Bid confirmed on-chain. Step 2 unlocks when your bid is the current highest.
                </p>
              )}
            </TabsContent>

            <TabsContent
              value="2"
              className={`m-0 overflow-y-auto rounded-2xl border border-white/55 bg-gradient-to-b from-white/72 to-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm transition-all duration-500 ${
                activeStep === 2 ? "max-h-[72vh]" : "max-h-[46vh]"
              }`}
            >
              <h3 className="mb-2 text-sm font-semibold text-[#2a2242]">Step 2: Video Script + Generation</h3>
              {!canAccessStep2 && (
                <p className="mb-3 text-xs text-[#2f2f46]">
                  Step 2 unlocks only when your bid is currently leading the auction.
                </p>
              )}

              {canAccessStep2 && (
                <div className="mb-[20px] rounded-lg border border-cyan-200/70 bg-cyan-50/70 px-3 py-2">
                  <p className="mb-3 text-xs font-semibold text-cyan-900">
                    Video generation status (background async job)
                  </p>

                  <div className="grid grid-cols-[36px_1fr_36px_1fr_36px] items-center gap-1 px-1 sm:grid-cols-[44px_1fr_44px_1fr_44px]">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold sm:h-11 sm:w-11 ${
                        isStepStartCurrent
                          ? "stepper-node-active border-blue-600 bg-blue-600 text-white"
                          : isStepStartDone
                          ? "border-green-700 bg-green-700 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isStepStartCurrent ? (
                        <FaSpinner className="animate-spin text-sm" />
                      ) : isStepStartDone ? (
                        "✓"
                      ) : (
                        "1"
                      )}
                    </div>
                    <div
                      className={`stepper-line h-1 rounded-full ${
                        isStepProcessingDone
                          ? "bg-green-700"
                          : isStepProcessingCurrent
                          ? "stepper-line-active bg-blue-300"
                          : "bg-slate-300"
                      }`}
                    />
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold sm:h-11 sm:w-11 ${
                        isStepProcessingCurrent
                          ? "stepper-node-active border-blue-600 bg-blue-600 text-white"
                          : isStepProcessingDone
                          ? "border-green-700 bg-green-700 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isStepProcessingCurrent ? (
                        <FaSpinner className="animate-spin text-sm" />
                      ) : isStepProcessingDone ? (
                        "✓"
                      ) : (
                        "2"
                      )}
                    </div>
                    <div
                      className={`stepper-line h-1 rounded-full ${
                        isStepDoneCurrent
                          ? "stepper-line-active bg-blue-300"
                          : isStepDone
                          ? "bg-green-700"
                          : "bg-slate-300"
                      }`}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              if (isStepDone && previewUrl) {
                                setShowCompletedPreviewModal(true);
                              }
                            }}
                            disabled={!isStepDone || !previewUrl}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors sm:h-11 sm:w-11 ${
                              isStepDoneCurrent
                                ? "stepper-node-active border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                                : isStepDone
                                ? "border-green-700 bg-green-700 text-white hover:bg-green-800"
                                : "border-slate-300 bg-white text-slate-400"
                            } ${!isStepDone || !previewUrl ? "cursor-default" : "cursor-pointer"}`}
                            aria-label="Done step"
                          >
                            <FaPlayCircle
                              className={isStepDoneCurrent ? "animate-pulse text-base" : "text-base"}
                            />
                          </button>
                        </TooltipTrigger>
                        {isStepDone && previewUrl && (
                          <TooltipContent>
                            <p className="text-xs">See video</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="mt-2 grid grid-cols-[36px_1fr_36px_1fr_36px] items-center text-center text-[11px] font-medium text-cyan-900/90 sm:grid-cols-[44px_1fr_44px_1fr_44px]">
                    <span className="col-start-1 justify-self-center">Start</span>
                    <span className="col-start-3 justify-self-center">Processing</span>
                    <span className="col-start-5 justify-self-center">Done</span>
                  </div>
                </div>
              )}

              {showStep2Controls && (
                <>
                  <p className="mb-2 text-[11px] text-[#5a5376]">
                    If you don&apos;t like the result, edit your URL/prompt/tone and click Regenerate.
                  </p>
                  <div className="mb-3 space-y-3">
                    <Input
                      id="step2-resource-url"
                      type="url"
                      value={rawResourceUrlInput}
                      onChange={(e) => setRawResourceUrlInput(e.target.value)}
                      placeholder="Project URL used for this bid"
                      className="bg-white text-[#1f1a31] placeholder:text-[#7b718f]"
                      disabled={!canAccessStep2 || isJobRunning}
                    />

                    <Textarea
                      id="step2-resource-description"
                      rows={2}
                      value={rawResourceMetadataInput}
                      onChange={(e) => setRawResourceMetadataInput(e.target.value)}
                      placeholder="Project description"
                      className="bg-white text-[#1f1a31] placeholder:text-[#7b718f]"
                      disabled={!canAccessStep2 || isJobRunning}
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
                                disabled={!canAccessStep2 || isJobRunning}
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
                              disabled={!canAccessStep2 || isJobRunning}
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
                                disabled={!canAccessStep2 || isJobRunning}
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
                    {jobId && jobStatus === "failed" && isJobRecoverable && (
                      <Button
                        variant="outline"
                        onClick={handleRecoverJob}
                        disabled={isJobRunning}
                        className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                      >
                        Resume Failed Job
                      </Button>
                    )}
                    <Button
                      onClick={handleRegenerateClick}
                      disabled={!canGenerate}
                      className="border border-black/20 bg-[#ff4fb2] text-white hover:bg-[#ff63bd]"
                    >
                      {isJobRunning ? "Generating..." : "Regenerate"}
                    </Button>
                  </div>
                </>
              )}

              {generationError && <p className="mb-2 text-xs text-red-500">{generationError}</p>}
            </TabsContent>
          </Tabs>

        </Card>
      </div>

      {showCompletedPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowCompletedPreviewModal(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div
            className="relative z-10 w-[min(92vw,760px)] rounded-2xl border border-white/40 bg-[#f4eef8] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#221a35]">Your generated video is ready</h4>
              <button
                type="button"
                aria-label="Close generated video preview"
                className="rounded-full border border-white/60 bg-white/60 px-2 py-1 text-xs font-bold text-[#3a3152] hover:bg-white"
                onClick={() => setShowCompletedPreviewModal(false)}
              >
                ×
              </button>
            </div>
            <video src={previewUrl} controls autoPlay className="max-h-[70vh] w-full rounded-lg object-cover" />
          </div>
        </div>
      )}

      {showRegenerateConfirmModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={() => setShowRegenerateConfirmModal(false)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div
            className="relative z-10 w-[min(92vw,620px)] rounded-2xl border border-white/40 bg-[#f4eef8] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-2 text-base font-semibold text-[#221a35]">
              Regenerate video?
            </h4>
            <p className="text-sm text-[#3a3152]">
              Are you sure you want to create the video again? This will replace the video currently shown to you.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#b8b2cf] bg-white text-[#1f1f33] hover:bg-[#f6f3ff]"
                onClick={() => setShowRegenerateConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="border border-black/20 bg-[#ff4fb2] text-white hover:bg-[#ff63bd]"
                onClick={handleConfirmRegenerate}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
