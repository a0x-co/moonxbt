"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Hash,
  Tag,
  Star,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  Bookmark,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Zap,
  Target,
  Users,
  Globe,
  Smartphone,
  Twitter,
  Send,
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Mic,
  MapPin,
  Link,
  AlertCircle,
  CheckCircle,
  Clock3,
  Trash2,
  Archive,
  Flag,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Calendar as CalendarComponent } from "@/components/shadcn/calendar";
import { Badge } from "@/components/shadcn/badge";
import { Switch } from "@/components/shadcn/switch";
import { Checkbox } from "@/components/shadcn/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface AdvancedSearchEngineProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Mock search results con diferentes tipos de contenido
const mockSearchResults = [
  {
    id: "result_1",
    type: "conversation",
    title: "High-value conversation about DeFi protocols",
    content:
      "User discussed advanced yield farming strategies and asked about smart contract security audits. Agent provided comprehensive technical analysis and risk assessment.",
    platform: "twitter",
    author: "@cryptoexpert",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sentiment: 0.8,
    engagement: { likes: 45, replies: 12, shares: 8 },
    tags: ["defi", "smart-contracts", "security", "yield-farming"],
    confidence: 0.92,
    relevance: 0.89,
    metadata: {
      conversationLength: 8,
      responseTime: "1.2s",
      userSatisfaction: 4.8,
      categories: ["technical", "financial"],
    },
  },
  {
    id: "result_2",
    type: "feedback",
    title: "Positive feedback on conversation quality",
    content:
      "Agent provided exceptional support for debugging a smart contract issue. Very knowledgeable and patient.",
    platform: "telegram",
    author: "Developer123",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    sentiment: 0.95,
    engagement: { likes: 23, replies: 3, shares: 2 },
    tags: ["feedback", "debugging", "smart-contracts", "support"],
    confidence: 0.87,
    relevance: 0.85,
    metadata: {
      rating: 5,
      category: "technical-support",
      resolved: true,
      timeToResolution: "15 minutes",
    },
  },
];

// Configuración de iconos por tipo de contenido
const contentTypeConfig = {
  conversation: {
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-600",
    label: "Conversation",
  },
  feedback: {
    icon: Star,
    color: "bg-green-100 text-green-600",
    label: "Feedback",
  },
  insight: {
    icon: Brain,
    color: "bg-purple-100 text-purple-600",
    label: "AI Insight",
  },
  alert: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
    label: "Alert",
  },
  task: {
    icon: CheckCircle,
    color: "bg-yellow-100 text-yellow-600",
    label: "Task",
  },
};

const platformConfig = {
  twitter: { icon: Twitter, color: "text-blue-500", label: "Twitter" },
  farcaster: { icon: Send, color: "text-purple-500", label: "Farcaster" },
  telegram: { icon: MessageCircle, color: "text-blue-400", label: "Telegram" },
  system: { icon: Zap, color: "text-gray-500", label: "System" },
};

export const AdvancedSearchEngine: React.FC<AdvancedSearchEngineProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(mockSearchResults);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const { toast } = useToast();

  // Estados de filtros
  const [filters, setFilters] = useState({
    platforms: [] as string[],
    contentTypes: [] as string[],
    sentimentRange: [0, 100] as number[],
    timeRange: "last-week" as string,
    customDateRange: null as { from: Date; to: Date } | null,
    engagementLevel: "all" as string,
    confidenceLevel: "all" as string,
    categories: [] as string[],
    tags: [] as string[],
    minEngagement: 0,
    sortBy: "relevance" as string,
    includeSystemGenerated: true,
    aiEnhancedSearch: true,
  });

  // Search analytics
  const searchAnalytics = useMemo(() => {
    const totalResults = searchResults.length;
    const avgConfidence =
      searchResults.reduce((sum, r) => sum + r.confidence, 0) / totalResults;
    const avgSentiment =
      searchResults.reduce((sum, r) => sum + r.sentiment, 0) / totalResults;
    const topTags = searchResults
      .flatMap((r) => r.tags)
      .reduce((acc: any, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    return {
      totalResults,
      avgConfidence: Math.round(avgConfidence * 100),
      avgSentiment: Math.round(avgSentiment * 100),
      topTags: Object.entries(topTags)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([tag]) => tag),
    };
  }, [searchResults]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      if (onAction) {
        await onAction("advanced-search", {
          query: searchQuery,
          filters,
          agentId: agent.agentId || agent.id,
          aiEnhanced: filters.aiEnhancedSearch,
        });
      }

      // Simular búsqueda
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Search completed",
        description: `Found ${searchResults.length} results matching your criteria`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not complete search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, onAction, agent, searchResults.length, toast]);

  const handleSaveQuery = useCallback(() => {
    if (!searchQuery.trim() || savedQueries.includes(searchQuery)) return;

    setSavedQueries((prev) => [...prev, searchQuery]);
    toast({
      title: "Query saved",
      description: "Search query has been saved for future use",
    });
  }, [searchQuery, savedQueries, toast]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.8) return "text-green-600";
    if (sentiment >= 0.6) return "text-green-500";
    if (sentiment >= 0.4) return "text-yellow-500";
    if (sentiment >= 0.2) return "text-orange-500";
    return "text-red-500";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.8) return "Very Positive";
    if (sentiment >= 0.6) return "Positive";
    if (sentiment >= 0.4) return "Neutral";
    if (sentiment >= 0.2) return "Negative";
    return "Very Negative";
  };

  return (
    <div className="rounded-[20px] bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Advanced Search Engine
          </h2>
          <p className="text-sm text-gray-500 mt-1">{`${searchAnalytics.totalResults} results • ${searchAnalytics.avgConfidence}% avg confidence • ${searchAnalytics.avgSentiment}% avg sentiment`}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={cn(
              "transition-colors",
              isFiltersOpen && "bg-purple-50 border-purple-300 text-purple-700"
            )}
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            Filters
            {isFiltersOpen ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </Button>

          {savedQueries.length > 0 && (
            <Select onValueChange={(value) => setSearchQuery(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Saved queries" />
              </SelectTrigger>
              <SelectContent>
                {savedQueries.map((query, index) => (
                  <SelectItem key={index} value={query}>
                    {query.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleSaveQuery}
            size="sm"
            variant="outline"
            disabled={!searchQuery.trim() || savedQueries.includes(searchQuery)}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Save Query
          </Button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Search Bar Principal */}
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations, feedback, insights, alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                {filters.aiEnhancedSearch && (
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    title="AI Enhanced Search"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2">
              {searchAnalytics.topTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newQuery = searchQuery
                      ? `${searchQuery} ${tag}`
                      : tag;
                    setSearchQuery(newQuery);
                  }}
                  className="text-xs"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({searchResults.length})
              </h3>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" />
                  Export Results
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {searchResults.map((result) => {
              const TypeConfig =
                contentTypeConfig[
                  result.type as keyof typeof contentTypeConfig
                ];
              const PlatformConfig =
                platformConfig[result.platform as keyof typeof platformConfig];
              const TypeIcon = TypeConfig.icon;
              const PlatformIcon = PlatformConfig.icon;

              return (
                <div
                  key={result.id}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200 hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    setSelectedResult(result);
                    setIsResultModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          TypeConfig.color
                        )}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {result.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <PlatformIcon
                              className={cn("w-3 h-3", PlatformConfig.color)}
                            />
                            <span>{result.author}</span>
                          </div>
                          <span>•</span>
                          <span>{result.timestamp.toLocaleString()}</span>
                          <span>•</span>
                          <span className={getSentimentColor(result.sentiment)}>
                            {getSentimentLabel(result.sentiment)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {Math.round(result.confidence * 100)}% confidence
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {Math.round(result.relevance * 100)}% relevance
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {result.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {result.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {result.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {result.engagement.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {result.engagement.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {result.engagement.shares}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Detail Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Result Details</DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 mt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      contentTypeConfig[
                        selectedResult.type as keyof typeof contentTypeConfig
                      ].color
                    )}
                  >
                    {(() => {
                      const Icon =
                        contentTypeConfig[
                          selectedResult.type as keyof typeof contentTypeConfig
                        ].icon;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedResult.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{selectedResult.author}</span>
                      <span>•</span>
                      <span>{selectedResult.timestamp.toLocaleString()}</span>
                      <span>•</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          contentTypeConfig[
                            selectedResult.type as keyof typeof contentTypeConfig
                          ].color
                        )}
                      >
                        {
                          contentTypeConfig[
                            selectedResult.type as keyof typeof contentTypeConfig
                          ].label
                        }
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 leading-relaxed">
                  {selectedResult.content}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-medium">
                        {Math.round(selectedResult.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Relevance</span>
                      <span className="font-medium">
                        {Math.round(selectedResult.relevance * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sentiment</span>
                      <span
                        className={cn(
                          "font-medium",
                          getSentimentColor(selectedResult.sentiment)
                        )}
                      >
                        {getSentimentLabel(selectedResult.sentiment)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Engagement
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Likes</span>
                      <span className="font-medium">
                        {selectedResult.engagement.likes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Replies</span>
                      <span className="font-medium">
                        {selectedResult.engagement.replies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shares</span>
                      <span className="font-medium">
                        {selectedResult.engagement.shares}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedResult.metadata && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(selectedResult.metadata).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                          <span className="font-medium">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
