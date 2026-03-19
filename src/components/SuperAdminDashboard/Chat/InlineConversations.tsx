"use client";

import React from "react";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Heart,
  Clock,
  Filter,
  BarChart3,
  Globe
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

interface InlineConversationsProps {
  data?: {
    conversations?: any[];
    analytics?: {
      total: number;
      platforms: Record<string, number>;
      sentiment: Record<string, number>;
    };
  };
  compact?: boolean;
}

/**
 * InlineConversations - Versión compacta del ConversationsViewer para chat
 */
export const InlineConversations: React.FC<InlineConversationsProps> = ({
  data,
  compact = true
}) => {
  // Mock data si no se proporciona
  const mockAnalytics = {
    total: 1247,
    platforms: {
      twitter: 456,
      farcaster: 321,
      telegram: 289,
      discord: 181
    },
    sentiment: {
      positive: 68.5,
      neutral: 25.2,
      negative: 6.3
    }
  };

  const mockConversations = [
    {
      id: "conv_1",
      platform: "twitter",
      user: "@crypto_enthusiast",
      preview: "Hey, can you explain how DeFi yield farming works?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      sentiment: "positive",
      responseTime: "45s",
      rating: 5
    },
    {
      id: "conv_2", 
      platform: "farcaster",
      user: "builder.eth",
      preview: "What's the best approach for smart contract security audits?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sentiment: "neutral", 
      responseTime: "1m 12s",
      rating: 4
    },
    {
      id: "conv_3",
      platform: "telegram",
      user: "DeFiTrader",
      preview: "I'm having trouble with metamask connection issues...",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      sentiment: "negative",
      responseTime: "2m 30s",
      rating: 3
    }
  ];

  const analytics = data?.analytics || mockAnalytics;
  const conversations = data?.conversations || mockConversations;

  const platformIcons = {
    twitter: "🐦",
    farcaster: "🟣", 
    telegram: "✈️",
    discord: "💬"
  };

  const sentimentColors = {
    positive: "bg-green-100 text-green-800",
    neutral: "bg-gray-100 text-gray-800", 
    negative: "bg-red-100 text-red-800"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Conversations Overview</h3>
              <p className="text-xs text-gray-600">{analytics.total.toLocaleString()} total conversations</p>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Filter className="w-3 h-3 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Total</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{analytics.total.toLocaleString()}</div>
            <div className="text-xs text-blue-600">Conversations</div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Sentiment</span>
            </div>
            <div className="text-lg font-bold text-green-900">{analytics.sentiment.positive}%</div>
            <div className="text-xs text-green-600">Positive</div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" />
            Platform Distribution
          </h4>
          
          <div className="space-y-2">
            {Object.entries(analytics.platforms).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{platformIcons[platform as keyof typeof platformIcons]}</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${(count / analytics.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Conversations
          </h4>
          
          <div className="space-y-2">
            {conversations.slice(0, compact ? 3 : 5).map((conv) => (
              <div key={conv.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{platformIcons[conv.platform as keyof typeof platformIcons]}</span>
                    <span className="font-medium text-gray-900 text-sm">{conv.user}</span>
                    <Badge className={cn("text-xs", sentimentColors[conv.sentiment as keyof typeof sentimentColors])}>
                      {conv.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < conv.rating ? "bg-yellow-400" : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {conv.preview}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {conv.timestamp.toLocaleTimeString()}
                  </span>
                  <span>Response: {conv.responseTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            Sentiment Analysis
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Positive</span>
              <span className="text-sm font-semibold text-green-700">{analytics.sentiment.positive}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${analytics.sentiment.positive}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Neutral</span>
              <span className="text-sm font-semibold text-gray-700">{analytics.sentiment.neutral}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full"
                style={{ width: `${analytics.sentiment.neutral}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negative</span>
              <span className="text-sm font-semibold text-red-700">{analytics.sentiment.negative}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${analytics.sentiment.negative}%` }}
              />
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
            <MessageSquare className="w-3 h-3 mr-1" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};