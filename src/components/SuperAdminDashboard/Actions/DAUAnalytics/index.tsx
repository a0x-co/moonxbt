"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DAUData {
  interaction_date: string;
  total_interactions: number;
}

interface DAUAnalytics {
  totalInteractions: number;
  avgDailyInteractions: number;
  peakDay: { date: string; interactions: number } | null;
  lowestDay: { date: string; interactions: number } | null;
  trendDirection: string;
  trendValue: number;
  daysWithActivity: number;
  daysWithoutActivity: number;
  activityRate: number;
}

interface DAUAnalyticsProps {
  agentId: string;
  agentName: string;
  dauData?: DAUData[];
  analytics?: DAUAnalytics;
  period?: number;
  isLoading?: boolean;
  isDark?: boolean;
  onRefresh?: () => Promise<void>;
  onExport?: () => void;
  onPeriodChange?: (days: number) => Promise<void>;
}

export const DAUAnalytics: React.FC<DAUAnalyticsProps> = ({
  agentId,
  agentName,
  dauData = [],
  analytics,
  period = 14,
  isLoading = false,
  isDark = false,
  onRefresh,
  onExport,
  onPeriodChange,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePeriodChange = async (days: number) => {
    setSelectedPeriod(days);
    if (onPeriodChange) {
      await onPeriodChange(days);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTrendIcon = () => {
    if (!analytics) return BarChart3;
    switch (analytics.trendDirection) {
      case 'increasing':
        return TrendingUp;
      case 'decreasing':
        return TrendingUp; // We'll rotate this with CSS
      default:
        return BarChart3;
    }
  };

  const getTrendColor = () => {
    if (!analytics) return 'text-gray-500';
    switch (analytics.trendDirection) {
      case 'increasing':
        return 'text-green-500';
      case 'decreasing':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-xl border",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Daily Active Users Analytics
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              {agentName} • Last {selectedPeriod} days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(Number(e.target.value))}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg border",
              isDark
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            )}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>

          {onExport && (
            <button
              onClick={onExport}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              )}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {analytics.totalInteractions.toLocaleString()}
              </div>
              <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                Total Interactions
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {Math.round(analytics.avgDailyInteractions)}
              </div>
              <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                Daily Average
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {analytics.activityRate}%
              </div>
              <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                Activity Rate
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn("text-2xl font-bold", getTrendColor())}>
                  {analytics.trendValue > 0 ? '+' : ''}{Math.round(analytics.trendValue)}
                </div>
                {React.createElement(getTrendIcon(), {
                  className: cn(
                    "w-5 h-5",
                    getTrendColor(),
                    analytics.trendDirection === 'decreasing' && "rotate-180"
                  )
                })}
              </div>
              <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                Trend ({analytics.trendDirection})
              </div>
            </div>
          </div>

          {/* Peak Day Info */}
          {analytics.peakDay && (
            <div className={cn(
              "p-4 rounded-lg mb-6",
              isDark ? "bg-blue-900/20 border border-blue-700/30" : "bg-blue-50 border border-blue-200"
            )}>
              <div className="flex items-center gap-3">
                <Calendar className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                <div>
                  <div className={cn("font-medium", isDark ? "text-blue-300" : "text-blue-700")}>
                    Peak Activity Day
                  </div>
                  <div className={cn("text-sm", isDark ? "text-blue-400" : "text-blue-600")}>
                    {analytics.peakDay.date}: {analytics.peakDay.interactions} interactions
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DAU Chart Placeholder */}
          {dauData.length > 0 && (
            <div className={cn(
              "p-6 rounded-lg",
              isDark ? "bg-gray-700/30" : "bg-gray-50"
            )}>
              <h4 className={cn("font-medium mb-4", isDark ? "text-white" : "text-gray-900")}>
                Daily Interactions Chart
              </h4>
              <div className="h-48 flex items-end justify-between gap-1">
                {dauData.map((day, index) => {
                  const maxInteractions = Math.max(...dauData.map(d => d.total_interactions));
                  const height = maxInteractions > 0 ? (day.total_interactions / maxInteractions) * 100 : 0;
                  
                  return (
                    <div
                      key={day.interaction_date}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div
                        className={cn(
                          "w-full bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t transition-all duration-300",
                          "group-hover:from-cyan-400 group-hover:to-blue-500"
                        )}
                        style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                      />
                      <div className={cn(
                        "text-xs mt-2 text-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        {new Date(day.interaction_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      {/* Tooltip */}
                      <div className={cn(
                        "absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                      )}>
                        {day.total_interactions} interactions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className={cn(
            "mt-6 p-4 rounded-lg",
            isDark ? "bg-gray-700/30" : "bg-gray-50"
          )}>
            <div className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
              📊 <strong>Summary:</strong> Over the last {selectedPeriod} days, your agent had{' '}
              <strong>{analytics.totalInteractions.toLocaleString()} total interactions</strong> with an average of{' '}
              <strong>{Math.round(analytics.avgDailyInteractions)} per day</strong>. Activity was recorded on{' '}
              <strong>{analytics.daysWithActivity} out of {selectedPeriod} days</strong> ({analytics.activityRate}% activity rate).
              {analytics.trendDirection !== 'stable' && (
                <span> User engagement is trending <strong>{analytics.trendDirection}</strong>.</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users className={cn("w-12 h-12 mx-auto mb-4", isDark ? "text-gray-600" : "text-gray-400")} />
          <p className={cn("text-lg font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
            No DAU data available
          </p>
          <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
            Click refresh to load daily active user analytics
          </p>
        </div>
      )}
    </motion.div>
  );
};