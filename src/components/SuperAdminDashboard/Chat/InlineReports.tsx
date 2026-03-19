"use client";

import React from "react";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

interface InlineReportsProps {
  data?: {
    reportType?: string;
    timeframe?: string;
    metrics?: Record<string, any>;
    charts?: any[];
    platformStats?: any;
    projectRankingsStats?: any;
    recentActivity?: any;
  };
  compact?: boolean;
  theme?: string;
}

/**
 * InlineReports - Versión compacta del AgentReportsPanel para chat
 */
export const InlineReports: React.FC<InlineReportsProps> = ({
  data,
  compact = true,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  // Usar datos reales o fallback a valores por defecto
  const reportData = {
    reportType: data?.reportType || "Performance Summary",
    timeframe: data?.timeframe || "Last 30 days",
    generatedAt: new Date().toISOString(),
    metrics: data?.metrics || {
      conversations: 0,
      users: 0,
      responseRate: 0,
      avgRating: 0,
      totalEngagement: 0,
      errorRate: 0,
    },
    platformStats: data?.platformStats,
    projectRankingsStats: data?.projectRankingsStats,
    recentActivity: data?.recentActivity,
  };

  const keyMetrics = [
    {
      label: "Conversations",
      value: reportData.metrics.conversations,
      change: reportData.platformStats?.summary?.totalConversations > 5 ? "+12.5%" : "No data",
      icon: MessageSquare,
      color: "blue",
    },
    {
      label: "Active Users",
      value: reportData.metrics.users,
      change: reportData.metrics.users > 0 ? "+8.3%" : "No activity",
      icon: Users,
      color: "green",
    },
    {
      label: "Response Rate",
      value: `${reportData.metrics.responseRate}%`,
      change: reportData.metrics.responseRate > 90 ? "+2.1%" : "Below target",
      icon: TrendingUp,
      color: "purple",
    },
    {
      label: "Avg Rating",
      value: `${reportData.metrics.avgRating}/5`,
      change: reportData.metrics.avgRating > 4 ? "+0.3" : "Needs improvement",
      icon: Eye,
      color: "amber",
    },
  ];

  const colorConfig = {
    blue: isDark
      ? "bg-blue-900/20 text-blue-400 border-blue-700/50"
      : "bg-blue-50 text-blue-600 border-blue-100",
    green: isDark
      ? "bg-green-900/20 text-green-400 border-green-700/50"
      : "bg-green-50 text-green-600 border-green-100",
    purple: isDark
      ? "bg-purple-900/20 text-purple-400 border-purple-700/50"
      : "bg-purple-50 text-purple-600 border-purple-100",
    amber: isDark
      ? "bg-amber-900/20 text-amber-400 border-amber-700/50"
      : "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm overflow-hidden",
        isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-100"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 border-b",
          isDark
            ? "bg-gradient-to-r from-green-900/20 to-blue-900/20 border-gray-700"
            : "bg-gradient-to-r from-green-50 to-blue-50 border-gray-100"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3
                className={cn(
                  "font-semibold text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {reportData.reportType}
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                {reportData.timeframe}
              </p>
            </div>
          </div>

          <Badge className="bg-green-100 text-green-800 text-xs">
            Generated
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {keyMetrics.slice(0, compact ? 4 : 6).map((metric, index) => {
            const IconComponent = metric.icon;
            const colorClasses =
              colorConfig[metric.color as keyof typeof colorConfig];

            return (
              <div
                key={index}
                className={cn("p-3 rounded-lg border", colorClasses)}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="w-4 h-4" />
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div
                  className={cn(
                    "text-lg font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {typeof metric.value === "number"
                    ? metric.value.toLocaleString()
                    : metric.value}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div
          className={cn(
            "p-3 rounded-lg",
            isDark ? "bg-gray-700/50" : "bg-gray-50"
          )}
        >
          <h4
            className={cn(
              "text-sm font-semibold mb-3 flex items-center gap-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Performance Highlights
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Total Engagement
              </span>
              <span
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {reportData.metrics.totalEngagement.toLocaleString()}{" "}
                interactions
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Error Rate
              </span>
              <span
                className={cn(
                  "font-semibold",
                  reportData.metrics.errorRate < 2
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {reportData.metrics.errorRate}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Avg Response Time
              </span>
              <span
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                1.2s
              </span>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3">
          <h4
            className={cn(
              "text-sm font-semibold flex items-center gap-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            Recent Activity
          </h4>

          <div className="space-y-2">
            {(() => {
              const activities = [];
              
              // Generar actividades basadas en datos reales
              if (reportData.recentActivity?.last24Hours?.interactions === 0) {
                activities.push({
                  time: "Last 24 hours",
                  event: "No recent interactions detected",
                  type: "info",
                });
              }
              
              if (reportData.recentActivity?.last7Days?.interactions > 0) {
                activities.push({
                  time: "Last 7 days",
                  event: `${reportData.recentActivity.last7Days.interactions} interactions recorded`,
                  type: "success",
                });
              }
              
              if (reportData.platformStats?.summary?.mostActivePlatform) {
                activities.push({
                  time: "Platform analysis",
                  event: `Most active platform: ${reportData.platformStats.summary.mostActivePlatform}`,
                  type: "info",
                });
              }
              
              // Si no hay datos reales, mostrar placeholder
              if (activities.length === 0) {
                activities.push({
                  time: "No data",
                  event: "Waiting for activity data...",
                  type: "info",
                });
              }
              
              return activities;
            })().map((activity, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-2 rounded border",
                  isDark
                    ? "bg-gray-700/50 border-gray-600"
                    : "bg-white border-gray-100"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    activity.type === "high"
                      ? "bg-red-400"
                      : activity.type === "success"
                      ? "bg-green-400"
                      : "bg-blue-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {activity.event}
                  </p>
                  <p
                    className={cn(
                      "text-xs flex items-center gap-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Actions */}
        <div
          className={cn(
            "flex items-center gap-2 pt-2 border-t",
            isDark ? "border-gray-700" : "border-gray-100"
          )}
        >
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export PDF
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Full Report
          </Button>
        </div>

        {/* Generation Info */}
        <div
          className={cn(
            "text-xs text-center pt-2 border-t",
            isDark
              ? "text-gray-500 border-gray-700"
              : "text-gray-500 border-gray-100"
          )}
        >
          Generated {new Date(reportData.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
