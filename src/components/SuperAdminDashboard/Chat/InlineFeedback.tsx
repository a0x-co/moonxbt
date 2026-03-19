"use client";

import React from "react";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp,
  Users,
  Star,
  Flag
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

interface InlineFeedbackProps {
  data?: {
    feedbacks?: any[];
    categories?: Record<string, number>;
    sentiment?: Record<string, number>;
    trends?: any[];
  };
  compact?: boolean;
}

/**
 * InlineFeedback - Versión compacta del FeedbackSystem para chat
 */
export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  data,
  compact = true
}) => {
  // Mock data si no se proporciona
  const mockData = {
    categories: {
      "Bug Report": 23,
      "Feature Request": 45,
      "General Feedback": 67,
      "Performance": 12,
      "UI/UX": 34
    },
    sentiment: {
      positive: 72.5,
      neutral: 18.2,
      negative: 9.3
    },
    feedbacks: [
      {
        id: "fb_1",
        category: "Performance",
        severity: "medium",
        title: "Response times could be faster",
        description: "Sometimes the agent takes too long to respond during peak hours",
        status: "pending",
        submittedAt: new Date(Date.now() - 30 * 60 * 1000),
        submittedBy: "admin@example.com",
        sentiment: "negative"
      },
      {
        id: "fb_2",
        category: "Feature Request", 
        severity: "low",
        title: "Add more personality traits",
        description: "Would love to see more diverse conversation styles",
        status: "in_review",
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        submittedBy: "user@example.com", 
        sentiment: "positive"
      },
      {
        id: "fb_3",
        category: "General Feedback",
        severity: "low",
        title: "Great job on recent updates!",
        description: "The new features are working perfectly",
        status: "acknowledged",
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        submittedBy: "feedback@example.com",
        sentiment: "positive"
      }
    ]
  };

  const feedbackData = { ...mockData, ...data };

  const severityConfig = {
    low: { color: "bg-green-100 text-green-800", icon: Star },
    medium: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    high: { color: "bg-red-100 text-red-800", icon: Flag }
  };

  const statusConfig = {
    pending: { color: "bg-gray-100 text-gray-800", label: "Pending" },
    in_review: { color: "bg-blue-100 text-blue-800", label: "In Review" },
    acknowledged: { color: "bg-green-100 text-green-800", label: "Acknowledged" },
    resolved: { color: "bg-purple-100 text-purple-800", label: "Resolved" }
  };

  const totalFeedbacks = Object.values(feedbackData.categories).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Feedback System</h3>
              <p className="text-xs text-gray-600">{totalFeedbacks} total feedback items</p>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <MessageCircle className="w-3 h-3 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sentiment Overview */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <ThumbsUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-900">{feedbackData.sentiment.positive}%</div>
            <div className="text-xs text-green-600">Positive</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <Users className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">{feedbackData.sentiment.neutral}%</div>
            <div className="text-xs text-gray-600">Neutral</div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg text-center">
            <ThumbsDown className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-900">{feedbackData.sentiment.negative}%</div>
            <div className="text-xs text-red-600">Negative</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            Feedback Categories
          </h4>
          
          <div className="space-y-2">
            {Object.entries(feedbackData.categories).slice(0, compact ? 3 : 5).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${(count / totalFeedbacks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            Recent Feedback
          </h4>
          
          <div className="space-y-2">
            {feedbackData.feedbacks.slice(0, compact ? 3 : 4).map((feedback) => {
              const severityInfo = severityConfig[feedback.severity as keyof typeof severityConfig];
              const statusInfo = statusConfig[feedback.status as keyof typeof statusConfig];
              const SeverityIcon = severityInfo.icon;
              
              return (
                <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SeverityIcon className="w-3 h-3 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm">{feedback.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={cn("text-xs", severityInfo.color)}>
                        {feedback.severity}
                      </Badge>
                      <Badge className={cn("text-xs", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {feedback.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{feedback.category}</span>
                    <span>{feedback.submittedAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Issues */}
        <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Trending Issues
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Response Time Performance</span>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">+15% reports</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Feature Requests</span>
              <Badge className="bg-green-100 text-green-800 text-xs">+8% requests</Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            View Trends
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Flag className="w-3 h-3 mr-1" />
            Priority Queue
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          {feedbackData.sentiment.positive > 70 ? '🎉' : '📊'} Overall sentiment is {feedbackData.sentiment.positive > 70 ? 'very positive' : 'trending positive'}
        </div>
      </div>
    </div>
  );
};