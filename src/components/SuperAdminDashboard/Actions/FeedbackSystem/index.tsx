"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  MessageSquare,
  Users,
  Search,
  Filter,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import FarcasterIcon from "@/components/Icons/FarcasterIcon";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface FeedbackSystemProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Mock data siguiendo estructura del backend de feedback admin
const mockFeedbacks = [
  {
    id: "fb_1",
    conversationId: "conv_123",
    platform: "twitter",
    category: "response_quality",
    severity: "medium",
    feedback:
      "The agent's response was too generic and didn't address the specific technical question about React hooks.",
    submittedBy: "admin",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "pending",
    tags: ["technical", "react", "specificity"],
    userMessage: "How do I use useEffect with cleanup functions in React?",
    agentResponse:
      "React hooks are useful for managing state and side effects in functional components.",
    sentiment: "negative",
    priority: "high",
  },
  {
    id: "fb_2",
    conversationId: "conv_456",
    platform: "farcaster",
    category: "personality_alignment",
    severity: "low",
    feedback:
      "Great response! The agent maintained the right tone and provided helpful information.",
    submittedBy: "user_feedback",
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: "resolved",
    tags: ["positive", "tone", "helpful"],
    userMessage: "What's your take on the latest crypto trends?",
    agentResponse:
      "I think there are some interesting developments in DeFi, particularly around yield farming strategies. What specific area interests you most?",
    sentiment: "positive",
    priority: "low",
  },
  {
    id: "fb_3",
    conversationId: "conv_789",
    platform: "telegram",
    category: "factual_accuracy",
    severity: "high",
    feedback:
      "The agent provided incorrect information about smart contract gas fees. This needs immediate correction.",
    submittedBy: "admin",
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: "in_review",
    tags: ["accuracy", "smart-contracts", "gas-fees", "urgent"],
    userMessage:
      "How much does it cost to deploy a smart contract on Ethereum?",
    agentResponse:
      "Smart contract deployment on Ethereum typically costs around $5-10 regardless of network congestion.",
    sentiment: "negative",
    priority: "high",
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

const severityConfig = {
  low: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200",
    label: "Low",
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "Medium",
  },
  high: {
    icon: AlertCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    label: "High",
  },
};

const categoryConfig = {
  response_quality: {
    label: "Response Quality",
    color: "bg-blue-100 text-blue-800",
  },
  personality_alignment: {
    label: "Personality",
    color: "bg-purple-100 text-purple-800",
  },
  factual_accuracy: { label: "Accuracy", color: "bg-red-100 text-red-800" },
  technical_issues: {
    label: "Technical",
    color: "bg-orange-100 text-orange-800",
  },
  user_experience: { label: "UX", color: "bg-green-100 text-green-800" },
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  dismissed: { label: "Dismissed", color: "bg-gray-100 text-gray-800" },
};

/**
 * FeedbackSystem - Sistema avanzado de gestión de feedback
 * Siguiendo patrones de ConversationReview.tsx y TwitterScheduledPosts.tsx
 */
export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New feedback form state
  const [newFeedback, setNewFeedback] = useState({
    category: "",
    severity: "medium",
    feedback: "",
    tags: "",
    conversationId: "",
  });

  const itemsPerPage = 10;
  const { toast } = useToast();

  // Filtering logic optimizado para performance
  const searchLower = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  const filteredFeedbacks = useMemo(() => {
    let filtered = mockFeedbacks;

    // Filter by search query - optimizado
    if (searchQuery) {
      filtered = filtered.filter(
        (fb) =>
          fb.feedback.toLowerCase().includes(searchLower) ||
          fb.userMessage.toLowerCase().includes(searchLower) ||
          fb.agentResponse.toLowerCase().includes(searchLower) ||
          fb.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((fb) => fb.category === selectedCategory);
    }

    // Filter by severity
    if (selectedSeverity !== "all") {
      filtered = filtered.filter((fb) => fb.severity === selectedSeverity);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((fb) => fb.status === selectedStatus);
    }

    // Sort feedbacks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.submittedAt.getTime() - a.submittedAt.getTime();
        case "severity":
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return (
            severityOrder[b.severity as keyof typeof severityOrder] -
            severityOrder[a.severity as keyof typeof severityOrder]
          );
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchLower, selectedCategory, selectedSeverity, selectedStatus, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics - siguiendo patrón de metrics del dashboard
  const analytics = useMemo(() => {
    const total = filteredFeedbacks.length;
    const severityCounts = filteredFeedbacks.reduce((acc, fb) => {
      acc[fb.severity] = (acc[fb.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusCounts = filteredFeedbacks.reduce((acc, fb) => {
      acc[fb.status] = (acc[fb.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgResponseTime = 24; // Mock average response time in hours

    return {
      total,
      severity: severityCounts,
      status: statusCounts,
      avgResponseTime,
    };
  }, [filteredFeedbacks]);

  const handleSubmitFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      if (onAction) {
        await onAction("submit-admin-feedback", {
          ...newFeedback,
          tags: newFeedback.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          agentId: agent.agentId || agent.id,
        });
      }

      // Reset form
      setNewFeedback({
        category: "",
        severity: "medium",
        feedback: "",
        tags: "",
        conversationId: "",
      });

      setIsSubmitModalOpen(false);

      toast({
        title: "Feedback submitted successfully",
        description:
          "Your feedback has been submitted and will be reviewed by the team.",
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error submitting feedback",
        description:
          "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onAction, newFeedback, agent, toast]);

  const handleUpdateFeedbackStatus = useCallback(
    async (feedbackId: string, newStatus: string) => {
      try {
        if (onAction) {
          await onAction("update-feedback-status", {
            feedbackId,
            status: newStatus,
            agentId: agent.agentId || agent.id,
          });
        }

        toast({
          title: "Status updated",
          description: `Feedback status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Error updating feedback status:", error);
        toast({
          title: "Error updating status",
          description: "There was an error updating the feedback status.",
          variant: "destructive",
        });
      }
    },
    [onAction, agent, toast]
  );

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
      title="Feedback Management System"
      subtitle={`Managing ${analytics.total} feedback entries for improved agent performance`}
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Send className="w-3 h-3 mr-1" />
            Submit Feedback
          </Button>
          <Button
            onClick={() => {
              // Export functionality
              console.log("Exporting feedback data...");
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
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
            <div className="text-xs text-blue-600">Feedback entries</div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                High Priority
              </span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {analytics.severity.high || 0}
            </div>
            <div className="text-xs text-red-600">Urgent issues</div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                Pending
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {analytics.status.pending || 0}
            </div>
            <div className="text-xs text-yellow-600">Awaiting review</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Resolved
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {analytics.status.resolved || 0}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>

        {/* Filters - siguiendo patrón de TwitterScheduledPosts */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              id="feedback-search"
              placeholder="Search feedback, messages, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm pl-10"
              aria-label="Search feedback entries"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="response_quality">Response Quality</SelectItem>
              <SelectItem value="personality_alignment">Personality</SelectItem>
              <SelectItem value="factual_accuracy">Accuracy</SelectItem>
              <SelectItem value="technical_issues">Technical</SelectItem>
              <SelectItem value="user_experience">UX</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="severity">By Severity</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback List - siguiendo patrón de ConversationReview */}
        <div className="space-y-3">
          {paginatedFeedbacks.map((feedback) => {
            const PlatformIcon =
              platformIcons[feedback.platform as keyof typeof platformIcons];
            const severityInfo =
              severityConfig[feedback.severity as keyof typeof severityConfig];
            const SeverityIcon = severityInfo.icon;
            const categoryInfo =
              categoryConfig[feedback.category as keyof typeof categoryConfig];
            const statusInfo =
              statusConfig[feedback.status as keyof typeof statusConfig];

            return (
              <div
                key={feedback.id}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setIsDetailModalOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedFeedback(feedback);
                    setIsDetailModalOpen(true);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View feedback details for ${feedback.category}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Platform Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        platformColors[
                          feedback.platform as keyof typeof platformColors
                        ]
                      )}
                    >
                      <PlatformIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            categoryInfo.color
                          )}
                        >
                          {categoryInfo.label}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            severityInfo.color
                          )}
                        >
                          <SeverityIcon className="w-3 h-3 inline mr-1" />
                          {severityInfo.label}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            statusInfo.color
                          )}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                        {feedback.feedback}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(feedback.submittedAt)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {feedback.submittedBy}
                        </span>
                      </div>

                      {feedback.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {feedback.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {feedback.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{feedback.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {feedback.priority === "high" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination - siguiendo patrón existente */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)}{" "}
              of {filteredFeedbacks.length} feedback entries
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

      {/* Feedback Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFeedback && (
                <>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      platformColors[
                        selectedFeedback.platform as keyof typeof platformColors
                      ]
                    )}
                  >
                    {(() => {
                      const PlatformIcon =
                        platformIcons[
                          selectedFeedback.platform as keyof typeof platformIcons
                        ];
                      return <PlatformIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Feedback Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedFeedback.category} •{" "}
                      {formatTimestamp(selectedFeedback.submittedAt)}
                    </p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6 mt-4">
              {/* Feedback Content */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </h4>
                <p className="text-sm text-gray-900">
                  {selectedFeedback.feedback}
                </p>
              </div>

              {/* Original Conversation */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Original Conversation
                </h4>

                <div className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedFeedback.userMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          {selectedFeedback.agentResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedFeedback.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {selectedFeedback.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateFeedbackStatus(
                            selectedFeedback.id,
                            "in_review"
                          )
                        }
                      >
                        Start Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateFeedbackStatus(
                            selectedFeedback.id,
                            "resolved"
                          )
                        }
                      >
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  {selectedFeedback.status === "in_review" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateFeedbackStatus(
                          selectedFeedback.id,
                          "resolved"
                        )
                      }
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Feedback Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit New Feedback</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <Select
                  value={newFeedback.category}
                  onValueChange={(value) =>
                    setNewFeedback({ ...newFeedback, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response_quality">
                      Response Quality
                    </SelectItem>
                    <SelectItem value="personality_alignment">
                      Personality
                    </SelectItem>
                    <SelectItem value="factual_accuracy">Accuracy</SelectItem>
                    <SelectItem value="technical_issues">Technical</SelectItem>
                    <SelectItem value="user_experience">UX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Severity
                </label>
                <Select
                  value={newFeedback.severity}
                  onValueChange={(value) =>
                    setNewFeedback({ ...newFeedback, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Conversation ID (Optional)
              </label>
              <Input
                placeholder="Enter conversation ID to link this feedback"
                value={newFeedback.conversationId}
                onChange={(e) =>
                  setNewFeedback({
                    ...newFeedback,
                    conversationId: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Feedback
              </label>
              <Textarea
                placeholder="Describe the issue or improvement suggestion..."
                value={newFeedback.feedback}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, feedback: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tags (comma-separated)
              </label>
              <Input
                placeholder="technical, accuracy, urgent"
                value={newFeedback.tags}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, tags: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={
                  !newFeedback.category ||
                  !newFeedback.feedback.trim() ||
                  isLoading
                }
              >
                {isLoading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
};
