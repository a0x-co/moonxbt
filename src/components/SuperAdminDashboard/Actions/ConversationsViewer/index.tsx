"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  MessageSquare,
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  ExternalLink,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import FarcasterIcon from "@/components/Icons/FarcasterIcon";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";

interface ConversationsViewerProps {
  agent: any;
  onAction?: (
    action: string,
    params: any
  ) => Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }>;
  data?: {
    conversations?: any[];
    analytics?: any;
    totalConversations?: number;
    platformStats?: Record<string, any>;
  };
}

// Mock data siguiendo estructura similar al ConversationReview existente
const mockConversations = [
  {
    id: "conv_1",
    platform: "twitter",
    username: "@johndoe",
    userDisplayName: "John Doe",
    lastMessage: "Thanks for the help with my project!",
    messageCount: 5,
    rating: 5,
    sentiment: "positive",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    hasLikes: true,
    hasDislikes: false,
    tags: ["support", "project"],
    agentResponse: "You're welcome! Glad I could help with your project setup.",
  },
  {
    id: "conv_2",
    platform: "farcaster",
    username: "alice.eth",
    userDisplayName: "Alice",
    lastMessage: "Can you explain how this works?",
    messageCount: 3,
    rating: 4,
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    hasLikes: false,
    hasDislikes: false,
    tags: ["question"],
    agentResponse:
      "Sure! Let me break down how the system works step by step...",
  },
  {
    id: "conv_3",
    platform: "telegram",
    username: "@tech_enthusiast",
    userDisplayName: "Tech Enthusiast",
    lastMessage: "This is exactly what I was looking for!",
    messageCount: 8,
    rating: 5,
    sentiment: "positive",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    hasLikes: true,
    hasDislikes: false,
    tags: ["feedback", "positive"],
    agentResponse:
      "Happy to hear that! Feel free to reach out if you need more assistance.",
  },
  {
    id: "conv_4",
    platform: "twitter",
    username: "@dev_sarah",
    userDisplayName: "Sarah Dev",
    lastMessage: "I'm having issues with the integration",
    messageCount: 12,
    rating: 2,
    sentiment: "negative",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    hasLikes: false,
    hasDislikes: true,
    tags: ["issue", "integration"],
    agentResponse:
      "I understand your frustration. Let me help you troubleshoot the integration...",
  },
];

const platformIcons = {
  twitter: FaXTwitter,
  farcaster: FarcasterIcon,
  telegram: FaTelegram,
  xmtp: MessageSquare,
};

const platformColors = {
  twitter: "text-blue-500 bg-blue-50 border-blue-200",
  farcaster: "text-purple-500 bg-purple-50 border-purple-200",
  telegram: "text-cyan-500 bg-cyan-50 border-cyan-200",
  xmtp: "text-gray-500 bg-gray-50 border-gray-200",
};

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    color: "text-green-600 bg-green-50",
    label: "Positive",
  },
  negative: {
    icon: TrendingDown,
    color: "text-red-600 bg-red-50",
    label: "Negative",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-600 bg-gray-50",
    label: "Neutral",
  },
};

/**
 * ConversationsViewer - Visualizador avanzado de conversaciones
 * Siguiendo patrones de ConversationReview.tsx y TwitterScheduledPosts.tsx
 */
export const ConversationsViewer: React.FC<ConversationsViewerProps> = ({
  agent,
  onAction,
  data,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const { toast } = useToast();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Load more conversations for infinite scroll
  const handleLoadMoreConversations = useCallback(async () => {
    if (!hasMoreData || isLoadingMore || !onAction) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const result = await onAction("GET_AGENT_CONVERSATIONS", {
        platform: selectedPlatform === "all" ? undefined : selectedPlatform,
        limit: 50, // Load more: 50 conversations per scroll
        cursor: cursor,
        includeAnalytics: true,
        includeFeedback: true,
      });

      if (result.success && result.data) {
        // Update pagination state for next load
        setHasMoreData(result.data.pagination?.hasMore || false);
        setCursor(result.data.pagination?.cursor);

        // Note: The new conversations will be provided via props update
        // The parent component should handle merging the new data
      }
    } catch (error) {
      console.error("Error loading more conversations:", error);
      toast({
        title: "Loading failed",
        description: "Failed to load more conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreData, isLoadingMore, onAction, selectedPlatform, cursor, toast]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasMoreData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreData && !isLoadingMore) {
          console.log(
            `🔄 [ConversationsViewer] Triggering load more for platform: ${selectedPlatform}`
          );
          handleLoadMoreConversations();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(loadMoreElement);
    console.log(
      `👀 [ConversationsViewer] Observer attached for platform: ${selectedPlatform}, hasMore: ${hasMoreData}, isLoading: ${isLoadingMore}`
    );

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [hasMoreData, selectedPlatform, handleLoadMoreConversations]); // Removed isLoadingMore from deps

  // Filtering logic optimizado con useCallback para mejor performance
  const searchLower = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  // Use real data if provided, otherwise fallback to mock data
  const sourceConversations = data?.conversations?.length
    ? data.conversations
    : mockConversations;

  const filteredConversations = useMemo(() => {
    let filtered = sourceConversations;

    // Filter by search query - optimizado para evitar múltiples toLowerCase()
    if (searchQuery) {
      filtered = filtered.filter(
        (conv) =>
          conv.username.toLowerCase().includes(searchLower) ||
          conv.userDisplayName.toLowerCase().includes(searchLower) ||
          conv.lastMessage.toLowerCase().includes(searchLower) ||
          conv.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filter by platform
    if (selectedPlatform !== "all") {
      filtered = filtered.filter((conv) => conv.platform === selectedPlatform);
    }

    // Filter by sentiment
    if (selectedSentiment !== "all") {
      filtered = filtered.filter(
        (conv) => conv.sentiment === selectedSentiment
      );
    }

    // Sort conversations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "rating":
          return b.rating - a.rating;
        case "messages":
          return b.messageCount - a.messageCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    sourceConversations,
    searchLower,
    selectedPlatform,
    selectedSentiment,
    sortBy,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics - usar datos reales si están disponibles, sino calcular desde conversaciones
  const analytics = useMemo(() => {
    // Si tenemos analytics del backend, usarlos
    if (data?.analytics) {
      return {
        total: data.totalConversations || filteredConversations.length,
        avgRating: "0.0", // Placeholder, se puede calcular si es necesario
        avgMessages: Math.round(
          filteredConversations.length > 0
            ? filteredConversations.reduce(
                (sum, conv) => sum + conv.messageCount,
                0
              ) / filteredConversations.length
            : 0
        ),
        sentiment: data.analytics.sentiment || {},
      };
    }

    // Fallback: calcular desde conversaciones locales
    const total = filteredConversations.length;
    const avgRating =
      total > 0
        ? filteredConversations.reduce((sum, conv) => sum + conv.rating, 0) /
          total
        : 0;
    const avgMessages =
      total > 0
        ? filteredConversations.reduce(
            (sum, conv) => sum + conv.messageCount,
            0
          ) / total
        : 0;
    const sentimentCounts = filteredConversations.reduce((acc, conv) => {
      acc[conv.sentiment] = (acc[conv.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      avgRating: avgRating.toFixed(1),
      avgMessages: Math.round(avgMessages),
      sentiment: sentimentCounts,
    };
  }, [data, filteredConversations]);

  const handleLoadConversations = async () => {
    setIsLoading(true);
    try {
      if (onAction) {
        const result = await onAction("GET_AGENT_CONVERSATIONS", {
          platform: selectedPlatform === "all" ? undefined : selectedPlatform,
          limit: 200, // Initial load: 200 conversations
          includeAnalytics: true,
          includeFeedback: true,
        });

        if (result.success && result.data) {
          // Update pagination state
          setHasMoreData(result.data.pagination?.hasMore || false);
          setCursor(result.data.pagination?.cursor);

          toast({
            title: "Conversations loaded",
            description:
              result.message || "Successfully loaded conversation data",
          });
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Loading failed",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      // Validar que hay datos para exportar
      if (filteredConversations.length === 0) {
        toast({
          title: "No data to export",
          description:
            "There are no conversations matching your current filters.",
          variant: "destructive",
        });
        return;
      }

      // Generar CSV con datos de conversaciones
      const csvData = filteredConversations.map((conv) => ({
        id: conv.id,
        platform: conv.platform,
        username: conv.username,
        userDisplayName: conv.userDisplayName,
        lastMessage: conv.lastMessage?.replace(/"/g, '""') || "", // Escapar comillas
        messageCount: conv.messageCount,
        rating: conv.rating,
        sentiment: conv.sentiment,
        timestamp: conv.timestamp.toISOString(),
        tags: conv.tags.join("; "),
        hasLikes: conv.hasLikes,
        hasDislikes: conv.hasDislikes,
      }));

      // Crear CSV con headers seguros
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((key) => `"${(row as any)[key] || ""}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversations-${agent.name || "agent"}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported ${csvData.length} conversations to CSV file.`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the conversation data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredConversations, agent.name, toast]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return timestamp.toLocaleDateString();
  };

  return (
    <AdminContainer
      title="Conversations Analytics"
      subtitle={
        data?.conversations?.length
          ? `Loaded ${analytics.total} real conversations from ${
              agent.name || "agent"
            }`
          : `Analyzing ${analytics.total} conversations (using mock data)`
      }
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isExporting}
          >
            <Download
              className={`w-3 h-3 mr-1 ${isExporting ? "animate-spin" : ""}`}
            />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            onClick={handleLoadConversations}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-all duration-200"
          >
            Load Latest
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Data Source Indicator */}
        {data?.conversations?.length && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Real conversation data loaded from {agent.name}
              </span>
              <span className="text-xs text-green-600">
                ({data.totalConversations} total conversations)
              </span>
            </div>
          </div>
        )}

        {/* Analytics Overview - siguiendo patrón de stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.total}
            </div>
            <div className="text-xs text-blue-600">Conversations</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Rating</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {analytics.avgRating}
            </div>
            <div className="text-xs text-amber-600">Average</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Messages
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {analytics.avgMessages}
            </div>
            <div className="text-xs text-green-600">Per conversation</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Positive
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {analytics.sentiment.positive || 0}
            </div>
            <div className="text-xs text-purple-600">Sentiment</div>
          </div>
        </div>

        {/* Filters - siguiendo patrón de TwitterScheduledPosts */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              id="conversation-search"
              placeholder="Search conversations, users, messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm pl-10"
              aria-label="Search conversations"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-32" aria-label="Filter by platform">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="farcaster">Farcaster</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="xmtp">XMTP</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedSentiment}
            onValueChange={setSelectedSentiment}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="messages">Most Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conversations List - siguiendo patrón de ConversationReview */}
        <div className="space-y-3">
          {paginatedConversations.map((conversation) => {
            const PlatformIcon =
              platformIcons[
                conversation.platform as keyof typeof platformIcons
              ];
            const sentimentInfo =
              sentimentConfig[
                conversation.sentiment as keyof typeof sentimentConfig
              ];
            const SentimentIcon = sentimentInfo.icon;

            return (
              <div
                key={conversation.id}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedConversation(conversation);
                  setIsDetailModalOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedConversation(conversation);
                    setIsDetailModalOpen(true);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View conversation with ${conversation.userDisplayName}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Platform Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        platformColors[
                          conversation.platform as keyof typeof platformColors
                        ]
                      )}
                    >
                      <PlatformIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.userDisplayName}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {conversation.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {conversation.lastMessage}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conversation.messageCount} messages
                        </span>

                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {conversation.rating}/5
                        </span>

                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full",
                            sentimentInfo.color
                          )}
                        >
                          <SentimentIcon className="w-3 h-3" />
                          <span>{sentimentInfo.label}</span>
                        </div>

                        {conversation.hasLikes && (
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                        )}
                        {conversation.hasDislikes && (
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                        )}
                      </div>

                      {conversation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conversation.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Infinite Scroll Loading Element */}
        {hasMoreData && (
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center py-6 min-h-[60px]"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-sm">Loading more conversations...</span>
              </div>
            ) : (
              <div className="w-full h-4 bg-transparent flex items-center justify-center">
                <span className="text-sm text-gray-400">
                  Scroll down to load more conversations
                </span>
              </div>
            )}
          </div>
        )}

        {!hasMoreData &&
          data?.conversations &&
          data.conversations.length > 0 && (
            <div className="flex items-center justify-center py-6">
              <span className="text-xs text-gray-400">
                No more conversations to load
              </span>
            </div>
          )}

        {/* Pagination - siguiendo patrón existente */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredConversations.length
              )}{" "}
              of {filteredConversations.length} conversations
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Detail Modal - siguiendo patrón de modales existentes */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedConversation && (
                <>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      platformColors[
                        selectedConversation.platform as keyof typeof platformColors
                      ]
                    )}
                  >
                    {(() => {
                      const PlatformIcon =
                        platformIcons[
                          selectedConversation.platform as keyof typeof platformIcons
                        ];
                      return <PlatformIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conversation with {selectedConversation.userDisplayName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.username} •{" "}
                      {formatTimestamp(selectedConversation.timestamp)}
                    </p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-6 mt-4">
              {/* Conversation Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Messages
                    </span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {selectedConversation.messageCount}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                      Rating
                    </span>
                  </div>
                  <div className="text-xl font-bold text-amber-900">
                    {selectedConversation.rating}/5
                  </div>
                </div>

                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    sentimentConfig[
                      selectedConversation.sentiment as keyof typeof sentimentConfig
                    ].color
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const SentimentIcon =
                        sentimentConfig[
                          selectedConversation.sentiment as keyof typeof sentimentConfig
                        ].icon;
                      return <SentimentIcon className="w-4 h-4" />;
                    })()}
                    <span className="text-sm font-medium">Sentiment</span>
                  </div>
                  <div className="text-xl font-bold">
                    {
                      sentimentConfig[
                        selectedConversation.sentiment as keyof typeof sentimentConfig
                      ].label
                    }
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Platform
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 capitalize">
                    {selectedConversation.platform}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedConversation.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConversation.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Thread - Mock */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Conversation Thread
                </h4>

                <div className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedConversation.lastMessage}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedConversation.userDisplayName} •{" "}
                        {formatTimestamp(selectedConversation.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedConversation.agentResponse}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agent.name || "Agent"} •{" "}
                        {formatTimestamp(selectedConversation.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {selectedConversation.hasLikes && (
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">User liked response</span>
                    </div>
                  )}
                  {selectedConversation.hasDislikes && (
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm">User disliked response</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onAction) {
                        onAction("flag-conversation", {
                          conversationId: selectedConversation.id,
                          reason: "manual_review",
                        });
                      }
                    }}
                  >
                    Flag for Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Copiar conversación al clipboard
                      const conversationText = `${selectedConversation.userDisplayName}: ${selectedConversation.lastMessage}\n${agent.name}: ${selectedConversation.agentResponse}`;
                      navigator.clipboard.writeText(conversationText);
                    }}
                  >
                    Copy Thread
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
};
