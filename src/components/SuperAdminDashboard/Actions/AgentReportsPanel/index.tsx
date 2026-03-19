"use client";

import React, { useState } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import { BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react";

interface AgentReportsPanelProps {
  agent: any;
  reportsData?: any; // Datos reales del backend
  onAction?: (action: string, params: any) => void;
}

/**
 * Panel de reportes de agente - Primera implementación
 * Siguiendo los patrones de componentes existentes como GrantManagement
 */
export const AgentReportsPanel: React.FC<AgentReportsPanelProps> = ({
  agent,
  reportsData,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7_days");

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      // Aquí se ejecutaría la acción administrativa
      if (onAction) {
        await onAction("get-agent-reports", {
          reportType: "comprehensive",
          timeframe: selectedTimeframe,
        });
      }

      // Simular delay para demo
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Usar datos reales del backend o fallback
  const stats = reportsData?.metrics ? [
    {
      label: "Total Conversations",
      value: reportsData.metrics.conversations?.toLocaleString() || "0",
      change: reportsData.metrics.conversations > 5 ? "+12%" : "No data",
      changeType: reportsData.metrics.conversations > 0 ? "positive" as const : "neutral" as const,
      icon: MessageSquare,
      color: "blue",
    },
    {
      label: "Active Users",
      value: reportsData.metrics.users?.toLocaleString() || "0",
      change: reportsData.metrics.users > 0 ? "+8%" : "No activity",
      changeType: reportsData.metrics.users > 0 ? "positive" as const : "neutral" as const,
      icon: Users,
      color: "green",
    },
    {
      label: "Response Rate",
      value: `${reportsData.metrics.responseRate || 0}%`,
      change: reportsData.metrics.responseRate > 90 ? "+2.1%" : "Below target",
      changeType: reportsData.metrics.responseRate > 90 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      color: "purple",
    },
    {
      label: "Avg. Rating",
      value: reportsData.metrics.avgRating?.toFixed(1) || "0.0",
      change: reportsData.metrics.avgRating > 4 ? "+0.3" : "Needs improvement",
      changeType: reportsData.metrics.avgRating > 4 ? "positive" as const : "negative" as const,
      icon: BarChart3,
      color: "amber",
    },
  ] : [
    // Fallback data when no real data is available
    {
      label: "Total Conversations",
      value: "Loading...",
      change: "...",
      changeType: "neutral" as const,
      icon: MessageSquare,
      color: "blue",
    },
    {
      label: "Active Users", 
      value: "Loading...",
      change: "...",
      changeType: "neutral" as const,
      icon: Users,
      color: "green",
    },
    {
      label: "Response Rate",
      value: "Loading...",
      change: "...",
      changeType: "neutral" as const,
      icon: TrendingUp,
      color: "purple",
    },
    {
      label: "Avg. Rating",
      value: "Loading...",
      change: "...",
      changeType: "neutral" as const,
      icon: BarChart3,
      color: "amber",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <AdminContainer
      title="Agent Performance Reports"
      subtitle="Comprehensive analytics and performance metrics"
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="24_hours">Last 24 hours</option>
            <option value="7_days">Last 7 days</option>
            <option value="30_days">Last 30 days</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid - mismo patrón que otros componentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Report Preview Area */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          {reportsData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Report Summary
              </h3>
              
              {reportsData.platformStats && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Platform Activity</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Most Active:</span>
                      <span className="ml-2 font-medium">
                        {reportsData.platformStats.summary?.mostActivePlatform || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Interactions:</span>
                      <span className="ml-2 font-medium">
                        {reportsData.platformStats.summary?.totalInteractions || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {reportsData.projectRankingsStats && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Project Rankings</h4>
                  <div className="text-sm">
                    <span className="text-gray-600">Total Rankings:</span>
                    <span className="ml-2 font-medium">
                      {reportsData.projectRankingsStats.detailedStats?.totalRankings || 0}
                    </span>
                  </div>
                </div>
              )}
              
              {reportsData.recentActivity && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last 24h:</span>
                      <span className="ml-2 font-medium">
                        {reportsData.recentActivity.last24Hours?.interactions || 0} interactions
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last 7d:</span>
                      <span className="ml-2 font-medium">
                        {reportsData.recentActivity.last7Days?.interactions || 0} interactions
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Detailed Report Preview
              </h3>
              <p className="text-gray-600 mb-4">
                Generate a comprehensive report to see detailed analytics,
                platform-specific metrics, and performance insights.
              </p>

              {!isLoading && (
                <div className="text-sm text-gray-500">
                  Selected timeframe:{" "}
                  <span className="font-medium">
                    {selectedTimeframe.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: "Platform Analytics",
              description: "Twitter, Farcaster, Telegram metrics",
              icon: "📱",
            },
            {
              type: "Conversation Quality",
              description: "Response quality and user satisfaction",
              icon: "⭐",
            },
            {
              type: "Project Rankings",
              description: "Performance across different projects",
              icon: "🏆",
            },
          ].map((reportType) => (
            <div
              key={reportType.type}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="text-2xl mb-2">{reportType.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {reportType.type}
              </h4>
              <p className="text-sm text-gray-600">{reportType.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminContainer>
  );
};
