"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Circle,
  MessageCircle,
  Play,
  Send,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import debounce from "lodash/debounce";
import { usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";
import { useLogout } from "@privy-io/react-auth";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  icon: React.ReactNode;
  points: number;
  getProfileUrl?: (username: string) => string;
}

const TASKS: Task[] = [
  {
    id: "hold-a0x",
    title: "Hold A0X Tokens",
    completed: false,
    icon: <Circle className="w-5 h-5 text-yellow-500" />,
    points: 10,
  },
  {
    id: "follow-farcaster",
    title: "Follow on Farcaster",
    completed: false,
    icon: (
      <Image
        src="/assets/farcaster.png"
        alt="Farcaster"
        width={20}
        height={20}
        className="inline-block"
      />
    ),
    points: 100,
    getProfileUrl: (username: string) => `https://warpcast.com/${username}`,
  },
  {
    id: "follow-twitter",
    title: "Follow on X (Twitter)",
    completed: false,
    icon: (
      <Image
        src="/assets/x.png"
        alt="X"
        width={20}
        height={20}
        className="inline-block"
      />
    ),
    points: 100,
    getProfileUrl: (username: string) => `https://twitter.com/${username}`,
  },
  {
    id: "follow-tiktok",
    title: "Follow on TikTok",
    completed: false,
    icon: <Play className="w-5 h-5 text-red-500" />,
    points: 100,
    getProfileUrl: (username: string) => `https://tiktok.com/@${username}`,
  },
  {
    id: "follow-instagram",
    title: "Follow on Instagram",
    completed: false,
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-pink-500"
      >
        <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
      </svg>
    ),
    points: 100,
    getProfileUrl: (username: string) => `https://instagram.com/${username}`,
  },
  {
    id: "join-telegram",
    title: "Join Telegram",
    completed: false,
    icon: <Send className="w-5 h-5 text-blue-500" />,
    points: 100,
    getProfileUrl: (username: string) => `https://t.me/${username}`,
  },
  {
    id: "follow-zora",
    title: "Follow on Zora",
    completed: false,
    icon: (
      <Image
        src="/assets/zora.png"
        alt="Zora"
        width={20}
        height={20}
        className="inline-block"
      />
    ),
    points: 100,
    getProfileUrl: (username: string) => `https://zora.co/${username}`,
  },
  {
    id: "share-miniapp",
    title: "Share Mini App",
    completed: false,
    icon: <MessageCircle className="w-5 h-5 text-purple-500" />,
    points: 50,
  },
];

interface Participant {
  fid: string;
  username: string;
  displayName: string;
  walletAddress: string;
  tasks: Record<string, any>;
  points: {
    total: number;
    a0x: number;
    other: number;
  };
  completedTasks: number;
  totalTasks: number;
  linkedUsernames?: Record<string, string>;
}

// Lista de wallets permitidas
const ALLOWED_WALLETS = [
  "0x863b8801d8125d2ba10b53268fd6313043843536",
  "0x2f2b1a3648c58cf224aa69a4b0bdc942f000045f",
  "0xa2b0405506b13f180e83a66a9903a839b6cbcecd",
  "0xbf6f95fa6639b5ba6ba819b900a14237168b41be",
  "0xfb902d7c2bee5faea588bd90823e9fa09b664c1c",
];

export function AirdropParticipantsTable() {
  const { ready, authenticated, user, login } = usePrivy();
  const { disconnect } = useDisconnect();
  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User logged out");
    },
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    fid: "",
    username: "",
    task: "",
    status: "",
    platform: "",
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    startAfter: "",
    hasMore: false,
  });
  const [updatingTasks, setUpdatingTasks] = useState<Record<string, boolean>>(
    {}
  );
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkUsernames, setBulkUsernames] = useState("");
  const [bulkPlatform, setBulkPlatform] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<Participant[]>([]);
  const [searchCache, setSearchCache] = useState<Record<string, Participant[]>>(
    {}
  );
  const [isSearching, setIsSearching] = useState(false);

  const platformUsernameMap = useMemo(() => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => {
      Object.entries(p.linkedUsernames || {}).forEach(
        ([platform, username]) => {
          if (username) {
            map.set(`${platform}:${username.toLowerCase()}`, p);
          }
        }
      );
    });
    return map;
  }, [participants]);

  const searchParticipants = useCallback(
    (usernames: string[], platform: string) => {
      const cacheKey = `${platform}:${usernames.sort().join(",")}`;

      if (searchCache[cacheKey]) {
        return searchCache[cacheKey];
      }

      const usernameSet = new Set(usernames.map((u) => u.toLowerCase()));
      const taskId = `follow-${platform.toLowerCase()}`;

      const matches = Array.from(usernameSet)
        .map((username) => platformUsernameMap.get(`${platform}:${username}`))
        .filter(
          (p): p is Participant =>
            p !== undefined && !p.tasks[taskId]?.completed
        );

      setSearchCache((prev) => ({
        ...prev,
        [cacheKey]: matches,
      }));

      return matches;
    },
    [platformUsernameMap, searchCache]
  );

  const debouncedUpdatePreview = useCallback(
    debounce((usernames: string, platform: string) => {
      if (!usernames || !platform) {
        setPreviewChanges([]);
        return;
      }

      setIsSearching(true);
      const usernamesList = usernames
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);

      console.log(
        `[Bulk Update] Searching for ${usernamesList.length} ${platform} usernames`
      );

      const matches = searchParticipants(usernamesList, platform);

      console.log(
        `[Bulk Update] Found ${matches.length} matching participants (excluding already completed tasks)`
      );
      setPreviewChanges(matches);
      setIsSearching(false);
    }, 300),
    [searchParticipants]
  );

  useEffect(() => {
    if (bulkUsernames && bulkPlatform) {
      debouncedUpdatePreview(bulkUsernames, bulkPlatform);
    }
  }, [bulkUsernames, bulkPlatform, debouncedUpdatePreview]);

  useEffect(() => {
    return () => {
      debouncedUpdatePreview.cancel();
    };
  }, [debouncedUpdatePreview]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      queryParams.append("limit", pagination.limit.toString());
      if (pagination.startAfter) {
        queryParams.append("startAfter", pagination.startAfter);
      }

      const response = await fetch(
        `/api/airdrop-participants?${queryParams}&getAll=true`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error loading participants");
      }

      setParticipants(data.participants);
      setPagination((prev) => ({
        ...prev,
        hasMore: data.pagination?.hasMore || false,
        startAfter: data.pagination?.nextPageStart || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, startAfter: "" }));
  };

  const handleLoadMore = () => {
    fetchParticipants();
  };

  const handleTaskUpdate = async (participant: Participant, task: Task) => {
    const taskKey = `${participant.fid}-${task.id}`;
    try {
      console.log(`[Task Update] Starting update for:`, {
        farcasterUsername: participant.username,
        taskId: task.id,
        currentStatus: participant.tasks[task.id]?.completed,
      });

      setUpdatingTasks((prev) => ({ ...prev, [taskKey]: true }));
      const response = await fetch("/api/airdrop-participants/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: participant.fid,
          taskId: task.id,
          completed: !participant.tasks[task.id]?.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update task");
      }

      console.log(`[Task Update] Successfully updated task for:`, {
        farcasterUsername: participant.username,
        taskId: task.id,
        newStatus: !participant.tasks[task.id]?.completed,
      });

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.fid === participant.fid) {
            return {
              ...p,
              tasks: {
                ...p.tasks,
                [task.id]: {
                  ...p.tasks[task.id],
                  completed: !p.tasks[task.id]?.completed,
                  verifiedByAdmin: true,
                  lastVerified: new Date().toISOString(),
                },
              },
            };
          }
          return p;
        })
      );

      toast.success("Task updated successfully");
    } catch (error) {
      console.error(`[Task Update] Error updating task:`, {
        farcasterUsername: participant.username,
        taskId: task.id,
        error,
      });
      toast.error(
        error instanceof Error ? error.message : "Failed to update task"
      );
    } finally {
      setUpdatingTasks((prev) => ({ ...prev, [taskKey]: false }));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUsernames || !bulkPlatform) return;

    try {
      setBulkUpdating(true);
      const usernames = bulkUsernames
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);

      console.log(
        `[Bulk Update] Starting update for ${usernames.length} ${bulkPlatform} usernames`
      );

      const taskId = `follow-${bulkPlatform.toLowerCase()}`;
      const matches = searchParticipants(usernames, bulkPlatform);

      const updates = matches.map((p) => {
        console.log(`[Bulk Update] Updating task for participant:`, {
          farcasterUsername: p.username,
          platformUsername: p.linkedUsernames?.[bulkPlatform],
          taskId,
        });
        return handleTaskUpdate(p, TASKS.find((t) => t.id === taskId)!);
      });

      console.log(`[Bulk Update] Sending ${updates.length} update requests`);
      await Promise.all(updates);

      console.log(`[Bulk Update] Successfully updated ${updates.length} tasks`);
      toast.success(`Updated ${updates.length} tasks successfully`);
      setBulkUpdateOpen(false);
      setBulkUsernames("");
      setPreviewChanges([]);
    } catch (error) {
      console.error(`[Bulk Update] Error updating tasks:`, error);
      toast.error("Failed to update tasks");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      disconnect();
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  const handleConnectClick = () => {
    login();
  };

  // Verificar si la wallet está permitida
  const isWalletAllowed = useMemo(() => {
    if (!authenticated || !user?.wallet?.address) return false;
    return ALLOWED_WALLETS.includes(user.wallet.address.toLowerCase());
  }, [authenticated, user?.wallet?.address]);

  // Si no está autenticado, mostrar botón de conexión
  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-widest uppercase text-center">
          Restricted Access
        </h2>
        <p className="text-lg md:text-2xl font-mono text-white/80 text-center">
          Please connect your wallet to access this view.
        </p>
        <Button
          onClick={handleConnectClick}
          className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Si está autenticado pero la wallet no está permitida
  if (!isWalletAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-widest uppercase text-center">
          Access Denied
        </h2>
        <p className="text-lg md:text-2xl font-mono text-white/80 text-center">
          Your wallet is not authorized to access this view.
        </p>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="w-full py-2.5 px-4 bg-red-500/40 hover:bg-red-500/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-widest uppercase text-center">
          Error
        </h2>
        <p className="text-lg md:text-2xl font-mono text-white/80 text-center">
          {error}
        </p>
      </div>
    );
  }

  // Si todo está bien, mostrar la tabla
  return (
    <div className="space-y-4 bg-[#0f2f88] p-8 rounded-2xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-widest uppercase text-center">
          Airdrop Participants
        </h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Search by FID"
            value={filters.fid}
            onChange={(e) => handleFilterChange("fid", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Input
            placeholder="Search by username"
            value={filters.username}
            onChange={(e) => handleFilterChange("username", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Select
            value={filters.platform}
            onValueChange={(value) => handleFilterChange("platform", value)}
          >
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white font-bold">
              <SelectValue
                placeholder="Platform"
                className="text-white font-bold"
              />
            </SelectTrigger>
            <SelectContent className="bg-[#1a237e] border-white/20">
              <SelectItem
                value="all"
                className="text-white font-bold hover:bg-white/10"
              >
                All Platforms
              </SelectItem>
              <SelectItem
                value="twitter"
                className="text-white font-bold hover:bg-white/10"
              >
                Twitter
              </SelectItem>
              <SelectItem
                value="instagram"
                className="text-white font-bold hover:bg-white/10"
              >
                Instagram
              </SelectItem>
              <SelectItem
                value="tiktok"
                className="text-white font-bold hover:bg-white/10"
              >
                TikTok
              </SelectItem>
              <SelectItem
                value="telegram"
                className="text-white font-bold hover:bg-white/10"
              >
                Telegram
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white font-bold">
              <SelectValue
                placeholder="Status"
                className="text-white font-bold"
              />
            </SelectTrigger>
            <SelectContent className="bg-[#1a237e] border-white/20">
              <SelectItem
                value="all"
                className="text-white font-bold hover:bg-white/10"
              >
                All Status
              </SelectItem>
              <SelectItem
                value="completed"
                className="text-white font-bold hover:bg-white/10"
              >
                Completed
              </SelectItem>
              <SelectItem
                value="pending"
                className="text-white font-bold hover:bg-white/10"
              >
                Pending
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setBulkUpdateOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ClipboardList className="w-4 h-4" />
            Bulk Update
          </Button>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20">
                <TableHead className="text-white/80">FID</TableHead>
                <TableHead className="text-white/80">Username</TableHead>
                <TableHead className="text-white/80">Display Name</TableHead>
                <TableHead className="text-white/80">Wallet</TableHead>
                <TableHead className="text-white/80">Total Points</TableHead>
                <TableHead className="text-white/80">A0X Points</TableHead>
                <TableHead className="text-white/80">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow
                  key={participant.fid}
                  className="border-white/20 hover:bg-white/5"
                >
                  <TableCell className="text-white/90">
                    {participant.fid}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://farcaster.xyz/${participant.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-200 hover:text-green-100"
                    >
                      {participant.username}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-white/90">
                    {participant.displayName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {participant.walletAddress !== undefined ? (
                      <Link
                        href={`https://basescan.org/address/${participant.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-200 hover:text-green-100"
                      >
                        {participant.walletAddress.slice(0, 6)}...
                        {participant.walletAddress.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-white/50">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell className="text-white/90">
                    {participant.points.total}
                  </TableCell>
                  <TableCell className="text-white/90">
                    {participant.points.a0x}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        {TASKS.map((task) => {
                          const taskKey = `${participant.fid}-${task.id}`;
                          const isCompleted =
                            participant.tasks[task.id]?.completed || false;
                          const isVerifiedByAdmin =
                            participant.tasks[task.id]?.verifiedByAdmin ||
                            false;
                          let platformUsername =
                            participant.linkedUsernames?.[
                              task.id.replace("follow-", "")
                            ];
                          if (task.id === "join-telegram") {
                            platformUsername =
                              participant.tasks[task.id]?.telegramUsername;
                          }

                          return (
                            <Tooltip key={task.id}>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1">
                                  {task.getProfileUrl && platformUsername ? (
                                    <Link
                                      href={task.getProfileUrl(
                                        platformUsername
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="cursor-pointer hover:opacity-80"
                                    >
                                      <div
                                        className={`border border-cyan-200 rounded-sm p-0.5 ${
                                          isCompleted
                                            ? "text-cyan-200"
                                            : "text-white/40"
                                        }`}
                                      >
                                        {task.icon}
                                      </div>
                                    </Link>
                                  ) : (
                                    <div
                                      className={`${
                                        isCompleted
                                          ? "text-cyan-200"
                                          : "text-white/40"
                                      }`}
                                    >
                                      {task.icon}
                                    </div>
                                  )}
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() =>
                                        handleTaskUpdate(participant, task)
                                      }
                                      disabled={updatingTasks[taskKey]}
                                      className={`h-4 w-4 rounded border-white/20 bg-white/10 transition-colors focus:ring-2 focus:ring-cyan-400 focus:outline-none ${
                                        isCompleted
                                          ? "border-green-400 bg-green-400"
                                          : "border-white/40 bg-white/10"
                                      }`}
                                    />
                                    {isVerifiedByAdmin && (
                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-200 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#1a237e] border-white/20 text-white">
                                <p>{task.title}</p>
                                <p className="text-sm text-white/70">
                                  {task.points} points
                                </p>
                                {isVerifiedByAdmin && (
                                  <p className="text-xs text-cyan-200 mt-1">
                                    Verified by admin
                                  </p>
                                )}
                                {platformUsername && (
                                  <p className="text-xs text-cyan-200 mt-1">
                                    Username: {platformUsername}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination.hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
          <DialogContent className="max-w-3xl bg-[#1752F0] border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-mono text-white">
                Bulk Update Tasks
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Paste a list of {bulkPlatform} usernames (one per line) to mark
                their tasks as completed. These usernames should match the{" "}
                {bulkPlatform} usernames linked to their Farcaster accounts.
                Participants with already completed tasks will be automatically
                excluded.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">
                  Platform
                </label>
                <Select value={bulkPlatform} onValueChange={setBulkPlatform}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a237e] border-white/20">
                    <SelectItem
                      value="instagram"
                      className="text-white hover:bg-white/10"
                    >
                      Instagram
                    </SelectItem>
                    <SelectItem
                      value="twitter"
                      className="text-white hover:bg-white/10"
                    >
                      Twitter
                    </SelectItem>
                    <SelectItem
                      value="tiktok"
                      className="text-white hover:bg-white/10"
                    >
                      TikTok
                    </SelectItem>
                    <SelectItem
                      value="telegram"
                      className="text-white hover:bg-white/10"
                    >
                      Telegram
                    </SelectItem>
                    <SelectItem
                      value="zora"
                      className="text-white hover:bg-white/10"
                    >
                      Zora
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">
                  {bulkPlatform} Usernames
                </label>
                <Textarea
                  value={bulkUsernames}
                  onChange={(e) => setBulkUsernames(e.target.value)}
                  placeholder={`Paste ${bulkPlatform} usernames here (one per line)`}
                  className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              {isSearching && (
                <div className="text-sm text-white/70">
                  Searching for matches...
                </div>
              )}
              {previewChanges.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">
                    Preview Changes
                  </label>
                  <div className="border border-white/20 rounded-md p-4 max-h-[300px] overflow-y-auto bg-white/5">
                    <div className="text-sm text-white/70 mb-2">
                      {previewChanges.length} participants will be updated
                      (excluding already completed tasks)
                    </div>
                    <div className="space-y-2">
                      {previewChanges.map((participant) => (
                        <div
                          key={participant.fid}
                          className="flex items-center justify-between text-sm text-white/90"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {participant.username}
                            </span>
                            <span className="text-white/70">
                              ({participant.displayName})
                            </span>
                            <span className="text-white/50">
                              [{bulkPlatform}:{" "}
                              {participant.linkedUsernames?.[bulkPlatform]}]
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">
                              Task: Follow {bulkPlatform}
                            </span>
                            <span className="text-cyan-200">→</span>
                            <span className="text-cyan-200">Completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {!isSearching && bulkUsernames && previewChanges.length === 0 && (
                <div className="text-sm text-yellow-400">
                  No matching participants found or all matching participants
                  already have this task completed.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkUpdateOpen(false);
                  setBulkUsernames("");
                  setPreviewChanges([]);
                }}
                disabled={bulkUpdating}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdate}
                disabled={
                  bulkUpdating ||
                  !bulkUsernames ||
                  !bulkPlatform ||
                  previewChanges.length === 0
                }
                className="bg-cyan-500/40 hover:bg-cyan-500/60 text-white border-white/20"
              >
                {bulkUpdating ? "Updating..." : "Update Tasks"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
