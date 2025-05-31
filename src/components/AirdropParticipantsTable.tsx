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
  ChevronLeft,
  ChevronRight,
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
  { id: "hold-a0x", title: "Hold A0X Tokens", completed: false, icon: <Circle className="w-5 h-5 text-yellow-500" />, points: 10, },
  { id: "follow-farcaster", title: "Follow on Farcaster", completed: false, icon: <Image src="/assets/farcaster.png" alt="Farcaster" width={20} height={20} className="inline-block" />, points: 100, getProfileUrl: (username: string) => `https://warpcast.com/${username}`, },
  { id: "follow-twitter", title: "Follow on X (Twitter)", completed: false, icon: <Image src="/assets/x.png" alt="X" width={20} height={20} className="inline-block" />, points: 100, getProfileUrl: (username: string) => `https://twitter.com/${username}`, },
  { id: "follow-tiktok", title: "Follow on TikTok", completed: false, icon: <Play className="w-5 h-5 text-red-500" />, points: 100, getProfileUrl: (username: string) => `https://tiktok.com/@${username}`, },
  { id: "follow-instagram", title: "Follow on Instagram", completed: false, icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-500" > <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" /> </svg> , points: 100, getProfileUrl: (username: string) => `https://instagram.com/${username}`, },
  { id: "join-telegram", title: "Join Telegram", completed: false, icon: <Send className="w-5 h-5 text-blue-500" />, points: 100, getProfileUrl: (username: string) => `https://t.me/${username}`, },
  { id: "follow-zora", title: "Follow on Zora", completed: false, icon: <Image src="/assets/zora.png" alt="Zora" width={20} height={20} className="inline-block" />, points: 100, getProfileUrl: (username: string) => `https://zora.co/${username}`, },
  { id: "share-miniapp", title: "Share Mini App", completed: false, icon: <MessageCircle className="w-5 h-5 text-purple-500" />, points: 50, },
];

interface Participant {
  fid: string;
  username: string;
  displayName: string;
  walletAddress: string;
  tasks: Record<string, any>;
  points: { total: number; a0x: number; other: number; };
  completedTasks: number;
  totalTasks: number;
  linkedUsernames?: Record<string, string>;
}

const ALLOWED_WALLETS = [ "0x863b8801d8125d2ba10b53268fd6313043843536", "0x68472e62719acb63f09affc4dac2d86690b0c676", "0x2f2b1a3648c58cf224aa69a4b0bdc942f000045f", "0xa2b0405506b13f180e83a66a9903a839b6cbcecd", "0xbf6f95fa6639b5ba6ba819b900a14237168b41be", "0xfb902d7c2bee5faea588bd90823e9fa09b664c1c", ];
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 500;

export function AirdropParticipantsTable() {
  const { ready, authenticated, user, login } = usePrivy();
  const { disconnect } = useDisconnect();
  const { logout } = useLogout({ onSuccess: () => console.log("User logged out"), });

  const [allParticipants, setAllParticipants] = useState<Participant[]>([]); // Raw data from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    fid: "", // For frontend filtering
    username: "", // For frontend filtering
    task: "", 
    status: "", // For backend filtering
    platform: "", // For backend filtering
  });

  const [fidSearchTerm, setFidSearchTerm] = useState("");
  const [usernameSearchTerm, setUsernameSearchTerm] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[2]);

  const [updatingTasks, setUpdatingTasks] = useState<Record<string, boolean>>({});
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkUsernames, setBulkUsernames] = useState("");
  const [bulkPlatform, setBulkPlatform] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<Participant[]>([]);
  const [searchCache, setSearchCache] = useState<Record<string, Participant[]>>({});
  const [isSearchingBulk, setIsSearchingBulk] = useState(false); // Renamed from isSearching

  const platformUsernameMap = useMemo(() => {
    const map = new Map<string, Participant>();
    allParticipants.forEach((p) => { // Use allParticipants for the map
      Object.entries(p.linkedUsernames || {}).forEach(
        ([platform, username]) => {
          if (username) {
            map.set(`${platform}:${username.toLowerCase()}`, p);
          }
        }
      );
    });
    return map;
  }, [allParticipants]);

  const searchParticipantsForBulk = useCallback( // Renamed for clarity
    (usernames: string[], platform: string) => {
      const cacheKey = `bulk:${platform}:${usernames.sort().join(",")}`;
      if (searchCache[cacheKey]) return searchCache[cacheKey];
      
      const usernameSet = new Set(usernames.map((u) => u.toLowerCase()));
      const taskId = platform === 'telegram' 
        ? `join-${platform.toLowerCase()}`
        : `follow-${platform.toLowerCase()}`;

      const matches = Array.from(usernameSet)
        .map((username) => platformUsernameMap.get(`${platform}:${username}`))
        .filter(
          (p): p is Participant =>
            p !== undefined && !p.tasks[taskId]?.completed
        );
      setSearchCache((prev) => ({ ...prev, [cacheKey]: matches }));
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
      setIsSearchingBulk(true);
      const usernamesList = usernames.split("\n").map((u) => u.trim()).filter((u) => u);
      const matches = searchParticipantsForBulk(usernamesList, platform);
      setPreviewChanges(matches);
      setIsSearchingBulk(false);
    }, 300),
    [searchParticipantsForBulk] 
  );

  useEffect(() => {
    if (bulkUsernames && bulkPlatform) {
      debouncedUpdatePreview(bulkUsernames, bulkPlatform);
    } else {
      setPreviewChanges([]);
    }
  }, [bulkUsernames, bulkPlatform, debouncedUpdatePreview]);

  useEffect(() => { return () => debouncedUpdatePreview.cancel(); }, [debouncedUpdatePreview]);

  useEffect(() => {
    const handler = debounce(() => {
      setFilters(prevFilters => ({
        ...prevFilters,
        fid: fidSearchTerm,
        username: usernameSearchTerm,
      }));
    }, SEARCH_DEBOUNCE_MS);
    handler();
    return () => handler.cancel();
  }, [fidSearchTerm, usernameSearchTerm]);

  const fetchParticipants = async () => {
    try {
      const queryParams = new URLSearchParams();
      // Only send filters to backend that it should handle with getAll=true
      if (filters.platform) queryParams.append("platform", filters.platform);
      if (filters.status) queryParams.append("status", filters.status);
      // if (filters.task) queryParams.append("task", filters.task);
      queryParams.append("getAll", "true");

      const response = await fetch(`/api/airdrop-participants?${queryParams}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error loading participants");
      
      setAllParticipants(data.participants); // Store raw data
      // setCurrentPage(1) is handled by useEffect [filters] or by filteredParticipants changing
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchParticipants();
    // This useEffect will also reset currentPage to 1 when filters.platform or filters.status change
    // because fetchParticipants will be called, and filteredParticipants will update.
  }, [filters.platform, filters.status]); // Fetch only when backend filters change


  // Frontend filtering for FID and Username
  const filteredParticipants = useMemo(() => {
    let result = allParticipants;
  
    if (filters.fid) {
      const fidSearch = filters.fid.toLowerCase();
      result = result.filter(p => 
        p.fid && p.fid.toLowerCase().includes(fidSearch) // Asegurar que p.fid existe
      );
    }
  
    if (filters.username) {
      const searchTerm = filters.username.toLowerCase();
      result = result.filter(p => {
        const usernameMatch = p.username && typeof p.username === 'string' 
          ? p.username.toLowerCase().includes(searchTerm) 
          : false;
        const displayNameMatch = p.displayName && typeof p.displayName === 'string'
          ? p.displayName.toLowerCase().includes(searchTerm)
          : false;
        return usernameMatch || displayNameMatch;
      });
    }
    return result;
  }, [allParticipants, filters.fid, filters.username]);

  // Reset page to 1 when frontend text filters change the filtered list
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.fid, filters.username]);


  const paginatedParticipants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredParticipants.slice(startIndex, endIndex);
  }, [filteredParticipants, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredParticipants.length / itemsPerPage);
  }, [filteredParticipants, itemsPerPage]);


  const handleSelectFilterChange = (key: "platform" | "status", value: string) => {
    // These filters trigger a backend refetch
    setFilters((prev) => ({ 
        ...prev, 
        [key]: value,
        // Reset text search terms when select filters change, if desired
        // fid: "", 
        // username: "" 
    }));
    // setFidSearchTerm(""); // Optionally clear text inputs too
    // setUsernameSearchTerm("");
  };

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleTaskUpdate = async (participant: Participant, task: Task) => {
    const taskKey = `${participant.fid}-${task.id}`;
    try {
      setUpdatingTasks((prev) => ({ ...prev, [taskKey]: true }));
      const response = await fetch("/api/airdrop-participants/task", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: participant.fid, taskId: task.id, completed: !participant.tasks[task.id]?.completed, }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to update task");
      
      // Update allParticipants, which will flow down to filtered/paginated
      setAllParticipants((prevAll) =>
        prevAll.map((p) =>
          p.fid === participant.fid
            ? { ...p, tasks: { ...p.tasks, [task.id]: { ...p.tasks[task.id], completed: !p.tasks[task.id]?.completed, verifiedByAdmin: true, lastVerified: new Date().toISOString(), }, }, }
            : p
        )
      );
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setUpdatingTasks((prev) => ({ ...prev, [taskKey]: false }));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUsernames || !bulkPlatform) return;
    try {
      setBulkUpdating(true);
      const usernames = bulkUsernames.split("\n").map((u) => u.trim()).filter((u) => u);
      const actualTaskId = bulkPlatform === 'telegram' ? `join-${bulkPlatform.toLowerCase()}` : `follow-${bulkPlatform.toLowerCase()}`;
      const taskToUpdate = TASKS.find((t) => t.id === actualTaskId);

      if (!taskToUpdate) {
        toast.error(`Invalid platform: ${bulkPlatform}`);
        setBulkUpdating(false); return;
      }
      const matches = searchParticipantsForBulk(usernames, bulkPlatform);
      // Since handleTaskUpdate now updates `allParticipants`, the UI will refresh.
      const updatePromises = matches.map((p) => handleTaskUpdate(p, taskToUpdate));
      await Promise.all(updatePromises);
      
      toast.success(`Updated ${matches.length} tasks successfully`);
      setBulkUpdateOpen(false);
      setBulkUsernames(""); setBulkPlatform(""); setPreviewChanges([]);
    } catch (error) {
      toast.error("Failed to update tasks");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleDisconnect = async () => { try { await logout(); disconnect(); } catch (error) { console.error("Error disconnecting:", error); } };
  const handleConnectClick = () => login();
  const isWalletAllowed = useMemo(() => {
    if (!authenticated || !user?.wallet?.address) return false;
    return ALLOWED_WALLETS.includes(user.wallet.address.toLowerCase());
  }, [authenticated, user?.wallet?.address]);

  if (!ready) return <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl"><p className="text-lg md:text-2xl  text-white/80 text-center">Loading authentication...</p></div>;
  if (!authenticated) return <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl"><h2 className="text-4xl md:text-5xl font-extrabold  text-white tracking-widest uppercase text-center">Restricted Access</h2><p className="text-lg md:text-2xl  text-white/80 text-center">Please connect your wallet to access this view.</p><Button onClick={handleConnectClick} className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white  text-sm rounded-lg border border-white/10 transition-all duration-300">Connect Wallet</Button></div>;
  if (!isWalletAllowed) return <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl"><h2 className="text-4xl md:text-5xl font-extrabold  text-white tracking-widest uppercase text-center">Access Denied</h2><p className="text-lg md:text-2xl  text-white/80 text-center">Your wallet is not authorized to access this view.</p><Button variant="outline" onClick={handleDisconnect} className="w-full py-2.5 px-4 bg-red-500/40 hover:bg-red-500/60 text-white  text-sm rounded-lg border border-white/10 transition-all duration-300">Disconnect</Button></div>;
  if (error && !loading) return <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-[#1752F0] p-8 rounded-2xl"><h2 className="text-4xl md:text-5xl font-extrabold  text-white tracking-widest uppercase text-center">Error</h2><p className="text-lg md:text-2xl  text-white/80 text-center">{error}</p><Button onClick={() => fetchParticipants()} className="bg-white/20">Retry</Button></div>;

  return (
    <div className="space-y-4 bg-[#0f2f88] p-8 rounded-2xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-5xl font-extrabold  text-white tracking-widest uppercase text-center">
          Airdrop Participants
        </h2>

        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <Input
            placeholder="Search by FID"
            value={fidSearchTerm}
            onChange={(e) => setFidSearchTerm(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Input
            placeholder="Search by Username/Display"
            value={usernameSearchTerm}
            onChange={(e) => setUsernameSearchTerm(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Select value={filters.platform} onValueChange={(value) => handleSelectFilterChange("platform", value || "")}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white font-bold"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent className="bg-[#1a237e] border-white/20">
              <SelectItem value="default" className="text-white font-bold hover:bg-white/10">All Platforms</SelectItem>
              <SelectItem value="twitter" className="text-white font-bold hover:bg-white/10">Twitter</SelectItem>
              <SelectItem value="instagram" className="text-white font-bold hover:bg-white/10">Instagram</SelectItem>
              <SelectItem value="tiktok" className="text-white font-bold hover:bg-white/10">TikTok</SelectItem>
              <SelectItem value="telegram" className="text-white font-bold hover:bg-white/10">Telegram</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => handleSelectFilterChange("status", value || "")}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white font-bold"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-[#1a237e] border-white/20">
              <SelectItem value="default" className="text-white font-bold hover:bg-white/10">All Status</SelectItem>
              <SelectItem value="completed" className="text-white font-bold hover:bg-white/10">Completed</SelectItem>
              <SelectItem value="pending" className="text-white font-bold hover:bg-white/10">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setBulkUpdateOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
            <ClipboardList className="w-4 h-4" /> Bulk Update
          </Button>
        </div>

        {loading ? (
           <div className="text-center py-10 text-white/70">Loading participants...</div>
        ) : filteredParticipants.length === 0 ? ( // Check filteredParticipants length
            <div className="text-center py-10 text-white/70">No participants found for the current filters.</div>
        ) : (
          <>
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-white/20">
                    <TableHead className="text-white/80">FID</TableHead>
                    <TableHead className="text-white/80">Username</TableHead>
                    <TableHead className="text-white/80">Display Name</TableHead>
                    <TableHead className="text-white/80">Wallet</TableHead>
                    <TableHead className="text-white/80">Total Points</TableHead>
                    <TableHead className="text-white/80">A0X Points</TableHead>
                    <TableHead className="text-white/80">Tasks</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {paginatedParticipants.map((participant) => ( // Use paginatedParticipants
                    <TableRow key={participant.fid} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white/90">{participant.fid}</TableCell>
                      <TableCell><Link href={`https://warpcast.com/${participant.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-200 hover:text-green-100">{participant.username} <ExternalLink className="w-3 h-3" /></Link></TableCell>
                      <TableCell className="text-white/90">{participant.displayName}</TableCell>
                      <TableCell className=" text-sm">
                        {participant.walletAddress ? <Link href={`https://basescan.org/address/${participant.walletAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-200 hover:text-green-100">{participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}<ExternalLink className="w-3 h-3" /></Link> : <span className="text-white/50">Not linked</span>}
                      </TableCell>
                      <TableCell className="text-white/90">{participant.points.total}</TableCell>
                      <TableCell className="text-white/90">{participant.points.a0x}</TableCell>
                      <TableCell><div className="flex gap-2 flex-wrap"><TooltipProvider>
                        {TASKS.map((task) => {
                          const taskKey = `${participant.fid}-${task.id}`;
                          const isCompleted = participant.tasks[task.id]?.completed || false;
                          const isVerifiedByAdmin = participant.tasks[task.id]?.verifiedByAdmin || false;
                          let platformUsername = participant.linkedUsernames?.[task.id.replace("follow-", "").replace("join-","")];
                          if (task.id === "join-telegram") platformUsername = participant.tasks[task.id]?.telegramUsername || platformUsername;
                          return (
                            <Tooltip key={task.id} delayDuration={100}><TooltipTrigger><div className="flex items-center gap-1">
                                {task.getProfileUrl && platformUsername ? <Link href={task.getProfileUrl(platformUsername)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="cursor-pointer hover:opacity-80"><div className={`border rounded-sm p-0.5 ${isCompleted ? "text-cyan-200 border-cyan-200" : "text-white/40 border-white/40"}`}>{task.icon}</div></Link> : <div className={`${isCompleted ? "text-cyan-200" : "text-white/40"}`}>{task.icon}</div>}
                                <div className="relative"><input type="checkbox" checked={isCompleted} onChange={() => handleTaskUpdate(participant, task)} disabled={updatingTasks[taskKey]} className={`h-4 w-4 rounded border-white/20 bg-white/10 transition-colors focus:ring-2 focus:ring-cyan-400 focus:outline-none ${isCompleted ? "border-green-400 bg-green-400" : "border-white/40 bg-white/10"}`} />{isVerifiedByAdmin && <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-200 rounded-full" />}</div>
                            </div></TooltipTrigger><TooltipContent className="bg-[#1a237e] border-white/20 text-white">
                                <p>{task.title}</p><p className="text-sm text-white/70">{task.points} points</p>
                                {isVerifiedByAdmin && <p className="text-xs text-cyan-200 mt-1">Verified by admin</p>}
                                {platformUsername && <p className="text-xs text-cyan-200 mt-1">Username: {platformUsername}</p>}
                                {!platformUsername && task.getProfileUrl && <p className="text-xs text-yellow-400 mt-1">Platform username not linked</p>}
                            </TooltipContent></Tooltip>
                          );})}
                      </TooltipProvider></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[70px] bg-white/10 border-white/20 text-white text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a237e] border-white/20">
                      {ITEMS_PER_PAGE_OPTIONS.map(size => <SelectItem key={size} value={size.toString()} className="text-white hover:bg-white/10 text-sm">{size}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Page {currentPage} of {totalPages} ({filteredParticipants.length} total)</span>
                  <div className="flex items-center gap-1">
                    <Button onClick={handlePrevPage} disabled={currentPage === 1 || loading} variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages || loading} variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
          <DialogContent className="max-w-3xl bg-[#1752F0] border-white/20 text-white">
            <DialogHeader><DialogTitle className="text-2xl font-bold  text-white">Bulk Update Tasks</DialogTitle><DialogDescription className="text-white/80">Paste a list of {bulkPlatform || "platform"} usernames (one per line) to mark their tasks as completed. These usernames should match the {bulkPlatform || "platform"} usernames linked to their Farcaster accounts. Participants with already completed tasks will be automatically excluded.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><label className="text-sm font-medium text-white/90">Platform</label>
                <Select value={bulkPlatform} onValueChange={setBulkPlatform}><SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent className="bg-[#1a237e] border-white/20">
                    {TASKS.filter(task => task.id.startsWith("follow-") || task.id === "join-telegram").map(task => (<SelectItem key={task.id} value={task.id.replace("follow-", "").replace("join-", "")} className="text-white hover:bg-white/10">{task.title.replace("Follow on ", "").replace("Join ", "")}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium text-white/90">{bulkPlatform ? `${bulkPlatform.charAt(0).toUpperCase() + bulkPlatform.slice(1)} Usernames` : "Usernames"}</label><Textarea value={bulkUsernames} onChange={(e) => setBulkUsernames(e.target.value)} placeholder={`Paste ${bulkPlatform || "platform"} usernames here (one per line)`} className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/50" disabled={!bulkPlatform}/></div>
              {isSearchingBulk && <div className="text-sm text-white/70">Searching for matches...</div>}
              {previewChanges.length > 0 && <div className="space-y-2"><label className="text-sm font-medium text-white/90">Preview Changes</label><div className="border border-white/20 rounded-md p-4 max-h-[300px] overflow-y-auto bg-white/5"><div className="text-sm text-white/70 mb-2">{previewChanges.length} participants will be updated (excluding already completed tasks)</div><div className="space-y-2">
                    {previewChanges.map((participant) => (<div key={participant.fid} className="flex items-center justify-between text-sm text-white/90"><div className="flex items-center gap-2"><span className="font-medium">{participant.username}</span><span className="text-white/70">({participant.displayName})</span><span className="text-white/50">[{bulkPlatform}: {participant.linkedUsernames?.[bulkPlatform] || participant.tasks[`follow-${bulkPlatform}`]?.telegramUsername || 'N/A'}]</span></div><div className="flex items-center gap-2"><span className="text-white/70">Task: Follow {bulkPlatform}</span><span className="text-cyan-200">→</span><span className="text-cyan-200">Completed</span></div></div>))}
              </div></div></div>}
              {!isSearchingBulk && bulkUsernames && bulkPlatform && previewChanges.length === 0 && <div className="text-sm text-yellow-400">No matching participants found or all matching participants already have this task completed.</div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setBulkUpdateOpen(false); setBulkUsernames(""); setBulkPlatform(""); setPreviewChanges([]);}} disabled={bulkUpdating} className="bg-white/10 hover:bg-white/20 text-white border-white/20">Cancel</Button>
              <Button onClick={handleBulkUpdate} disabled={bulkUpdating || !bulkUsernames || !bulkPlatform || previewChanges.length === 0} className="bg-cyan-500/40 hover:bg-cyan-500/60 text-white border-white/20">{bulkUpdating ? "Updating..." : `Update ${previewChanges.length} Tasks`}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}