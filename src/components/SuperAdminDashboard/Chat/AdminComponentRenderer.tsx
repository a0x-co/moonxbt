"use client";

import React from "react";
import {
  SuperAdminMetadata,
  AdminComponentData,
} from "@/types/superadmin-chat";
import { InlineAnalytics } from "./InlineAnalytics";
import { InlineReports } from "./InlineReports";
import { InlineConversations } from "./InlineConversations";
import { InlineFeedback } from "./InlineFeedback";
import { InlineTasks } from "./InlineTasks";
import { InlinePersonality } from "./InlinePersonality";
import { InlinePersonalityForm } from "./InlinePersonalityForm";
import { InlineTaskScheduler } from "./InlineTaskScheduler";
import { InlineFeedbackForm } from "./InlineFeedbackForm";
import { InlineSystemHealth } from "./InlineSystemHealth";
import { InlineBuilderGrants } from "./InlineBuilderGrants";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminComponentRendererProps {
  metadata: SuperAdminMetadata;
  data?: AdminComponentData;
  compact?: boolean;
  theme?: string;
  // Handlers for SET/UPDATE actions
  onPersonalityUpdate?: (data: any) => Promise<void>;
  onTaskSchedule?: (data: any) => Promise<void>;
  onFeedbackSubmit?: (data: any) => Promise<void>;
  onSystemRefresh?: () => Promise<any>;
  onGrantBuilder?: (data: any) => Promise<void>;
  onProjectRank?: (data: any) => Promise<void>;
  onGithubAnalyze?: (data: any) => Promise<void>;
}

/**
 * AdminComponentRenderer - Renderiza componentes admin dinámicamente basado en metadata
 */
export const AdminComponentRenderer: React.FC<AdminComponentRendererProps> = ({
  metadata,
  data,
  compact = true,
  theme = "light",
  onPersonalityUpdate,
  onTaskSchedule,
  onFeedbackSubmit,
  onSystemRefresh,
  onGrantBuilder,
  onProjectRank,
  onGithubAnalyze,
}) => {
  if (metadata.type !== "component_render") {
    return null;
  }

  const isDark = theme === "dark";

  const renderComponent = () => {
    switch (metadata.component) {
      case "analytics":
        return (
          <InlineAnalytics
            data={data?.analyticsData}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "reports":
        return (
          <InlineReports
            data={data?.reportsData}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "conversations":
        return (
          <InlineConversations
            data={data?.conversationsData}
            compact={compact}
            {...(metadata.props || {})}
          />
        );

      case "feedback":
        return (
          <InlineFeedback
            data={data?.feedbackData}
            compact={compact}
            {...(metadata.props || {})}
          />
        );

      case "tasks":
        return (
          <InlineTasks
            data={data?.tasksData}
            compact={compact}
            {...(metadata.props || {})}
          />
        );

      case "personality":
        return (
          <InlinePersonality
            data={data?.personalityData}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      // === SET/UPDATE COMPONENTS ===
      case "personality_form":
        return (
          <InlinePersonalityForm
            data={data?.personalityData}
            onUpdate={onPersonalityUpdate}
            isDark={isDark}
            {...(metadata.props || {})}
          />
        );

      case "task_scheduler":
        return (
          <InlineTaskScheduler
            data={data?.schedulerData}
            onSchedule={onTaskSchedule}
            isDark={isDark}
            {...(metadata.props || {})}
          />
        );

      case "feedback_form":
        return (
          <InlineFeedbackForm
            data={data?.feedbackFormData}
            onSubmit={onFeedbackSubmit}
            isDark={isDark}
            {...(metadata.props || {})}
          />
        );

      case "system_health":
        return (
          <InlineSystemHealth
            data={data?.systemHealthData}
            onRefresh={onSystemRefresh}
            isDark={isDark}
            {...(metadata.props || {})}
          />
        );

      case "builder_grants":
        return (
          <InlineBuilderGrants
            data={data?.grantsData}
            onGrant={onGrantBuilder}
            isDark={isDark}
            {...(metadata.props || {})}
          />
        );

      // === ADDITIONAL ANALYTICS COMPONENTS ===
      case "daily_users":
        return (
          <InlineAnalytics
            data={data?.dailyUsersData}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "github_metrics":
        return (
          <InlineReports
            data={data?.githubMetricsData}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "project_ranking":
        return (
          <InlineReports
            data={{
              reportType: "project_ranking",
              metrics: {
                rankings: data?.projectRankingData?.rankings?.length || 0,
              },
              charts: data?.projectRankingData?.rankings || [],
            }}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "builder_validation":
        return (
          <InlineReports
            data={{
              reportType: "builder_validation",
              metrics: {
                builders: data?.builderValidationData?.builders?.length || 0,
              },
              charts: data?.builderValidationData?.builders || [],
            }}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      case "project_progress":
        return (
          <InlineReports
            data={{
              reportType: "project_progress",
              metrics: {
                projects: data?.projectProgressData?.projects?.length || 0,
              },
              charts: data?.projectProgressData?.projects || [],
            }}
            compact={compact}
            theme={theme}
            {...(metadata.props || {})}
          />
        );

      default:
        return (
          <div
            className={cn(
              "border rounded-lg p-4",
              isDark
                ? "bg-gray-800/50 border-gray-700 text-gray-300"
                : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                Unknown component: {metadata.component}
              </span>
            </div>
          </div>
        );
    }
  };

  return <div className="my-3">{renderComponent()}</div>;
};
