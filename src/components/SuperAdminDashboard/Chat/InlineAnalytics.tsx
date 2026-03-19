"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Progress } from "@/components/shadcn/progress";
import { cn } from "@/lib/utils";

interface InlineAnalyticsProps {
  data?: {
    trends?: any[];
    metrics?: Record<string, any>;
    predictions?: any[];
    anomalies?: any[];
  };
  compact?: boolean;
  theme?: string;
}

/**
 * InlineAnalytics - Versión compacta del TrendAnalyzer para chat
 */
export const InlineAnalytics: React.FC<InlineAnalyticsProps> = ({
  data,
  compact = true,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  // Mock data si no se proporciona
  const mockMetrics = {
    confidence: 94,
    trend: "+15.2%",
    isPositive: true,
    volatility: 12.3,
    anomalies: 2,
  };

  const mockPredictions = [
    {
      metric: "Response Time",
      current: "1.2s",
      predicted: "0.9s",
      improvement: "+25%",
      confidence: 89,
    },
    {
      metric: "User Satisfaction",
      current: "4.2/5",
      predicted: "4.6/5",
      improvement: "+9.5%",
      confidence: 92,
    },
  ];

  const mockAnomalies = [
    {
      type: "conversation_spike",
      severity: "medium",
      description: "Unusual conversation volume increase detected",
      confidence: 85,
    },
    {
      type: "response_optimization",
      severity: "low",
      description: "Response time improvement opportunity",
      confidence: 78,
    },
  ];

  const metrics = data?.metrics || mockMetrics;
  const predictions = data?.predictions || mockPredictions;
  const anomalies = data?.anomalies || mockAnomalies;

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
            ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-100"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold text-sm",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Analytics Overview
            </h3>
            <p
              className={cn(
                "text-xs",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              AI-powered trend analysis
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "p-3 rounded-lg",
              isDark ? "bg-blue-900/20" : "bg-blue-50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                Accuracy
              </span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {metrics.confidence}%
            </div>
            <div className="text-xs text-blue-600">Model Confidence</div>
          </div>

          <div
            className={cn(
              "p-3 rounded-lg",
              isDark ? "bg-green-900/20" : "bg-green-50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              {metrics.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className="text-xs font-medium text-green-700">Trend</span>
            </div>
            <div
              className={cn(
                "text-lg font-bold",
                metrics.isPositive ? "text-green-900" : "text-red-900"
              )}
            >
              {metrics.trend}
            </div>
            <div className="text-xs text-green-600">Next 7 Days</div>
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-3">
          <h4
            className={cn(
              "text-sm font-semibold flex items-center gap-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            <Brain className="w-4 h-4 text-purple-600" />
            AI Predictions
          </h4>

          {predictions.slice(0, compact ? 2 : 4).map((prediction, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg",
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {prediction.metric}
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {prediction.improvement}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Current: {prediction.current}
                </span>
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Predicted: {prediction.predicted}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Confidence
                </span>
                <span
                  className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {prediction.confidence}%
                </span>
              </div>
              <Progress value={prediction.confidence} className="h-1" />
            </div>
          ))}
        </div>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <div className="space-y-3">
            <h4
              className={cn(
                "text-sm font-semibold flex items-center gap-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Detected Anomalies ({anomalies.length})
            </h4>

            {anomalies.slice(0, compact ? 2 : 3).map((anomaly, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border",
                  isDark
                    ? "bg-amber-900/20 border-amber-700/50"
                    : "bg-amber-50 border-amber-100"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={cn(
                          "text-xs",
                          anomaly.severity === "high"
                            ? "bg-red-100 text-red-800"
                            : anomaly.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        )}
                      >
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span
                        className={cn(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        {anomaly.confidence}% confidence
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      {anomaly.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Insights Summary */}
        <div
          className={cn(
            "p-3 rounded-lg border",
            isDark
              ? "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50"
              : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span
              className={cn(
                "text-sm font-semibold",
                isDark ? "text-purple-300" : "text-purple-900"
              )}
            >
              AI Recommendation
            </span>
          </div>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-purple-200" : "text-purple-800"
            )}
          >
            Based on current trends, implementing response time optimization
            could improve user satisfaction by 25% with high confidence.
          </p>
        </div>
      </div>
    </div>
  );
};
