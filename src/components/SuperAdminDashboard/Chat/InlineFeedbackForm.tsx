"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Bug,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackData {
  title: string;
  description: string;
  category: "bug" | "feature" | "improvement" | "question" | "other";
  severity: "low" | "medium" | "high" | "critical";
  context?: string;
}

interface InlineFeedbackFormProps {
  data?: {
    agentId?: string;
    agentName?: string;
    userContext?: string;
  };
  onSubmit?: (feedback: FeedbackData) => Promise<void>;
  isLoading?: boolean;
  isDark?: boolean;
}

const FEEDBACK_CATEGORIES = [
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    color: "text-red-500",
    description: "Something is broken or not working as expected",
  },
  {
    value: "feature",
    label: "Feature Request",
    icon: Lightbulb,
    color: "text-yellow-500",
    description: "Suggest a new feature or enhancement",
  },
  {
    value: "improvement",
    label: "Improvement",
    icon: TrendingUp,
    color: "text-blue-500",
    description: "Suggest improvements to existing functionality",
  },
  {
    value: "question",
    label: "Question",
    icon: MessageCircle,
    color: "text-purple-500",
    description: "Ask a question about the system",
  },
  {
    value: "other",
    label: "Other",
    icon: AlertTriangle,
    color: "text-gray-500",
    description: "General feedback or other topics",
  },
] as const;

const SEVERITY_LEVELS = [
  {
    value: "low",
    label: "Low",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  {
    value: "high",
    label: "High",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    value: "critical",
    label: "Critical",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
] as const;

export function InlineFeedbackForm({
  data,
  onSubmit,
  isLoading = false,
  isDark = false,
}: InlineFeedbackFormProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    title: "",
    description: "",
    category: "bug",
    severity: "medium",
    context: data?.userContext || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    // Basic validation
    if (!feedbackData.title.trim() || !feedbackData.description.trim()) {
      setError("Please fill in title and description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(feedbackData);
      setSuccess(true);

      // Reset form
      setFeedbackData({
        title: "",
        description: "",
        category: "bug",
        severity: "medium",
        context: data?.userContext || "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = FEEDBACK_CATEGORIES.find(
    (cat) => cat.value === feedbackData.category
  );
  const selectedSeverity = SEVERITY_LEVELS.find(
    (sev) => sev.value === feedbackData.severity
  );

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3
            className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Submit Internal Feedback
          </h3>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Report issues, bugs, or improvement suggestions
            {data?.agentName && (
              <span className="ml-1">for {data.agentName}</span>
            )}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={cn(
            "flex items-center gap-2 p-3 mb-4 rounded-lg",
            "bg-red-50 border border-red-200 text-red-700",
            isDark && "bg-red-900/20 border-red-800 text-red-400"
          )}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:bg-red-100 dark:hover:bg-red-800/30 p-1 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={cn(
            "flex items-center gap-2 p-3 mb-4 rounded-lg",
            "bg-green-50 border border-green-200 text-green-700",
            isDark && "bg-green-900/20 border-green-800 text-green-400"
          )}
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">
            Feedback submitted successfully! Thank you for helping us improve.
          </span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selection */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-3",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Feedback Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEEDBACK_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isSelected = feedbackData.category === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      category: category.value,
                    }))
                  }
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={cn("w-4 h-4", category.color)} />
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {category.label}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Title *
          </label>
          <input
            type="text"
            value={feedbackData.title}
            onChange={(e) =>
              setFeedbackData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={cn(
              "w-full p-3 rounded-lg border transition-colors",
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500"
            )}
            placeholder={`Brief summary of your ${selectedCategory?.label.toLowerCase()}...`}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Description *
          </label>
          <textarea
            value={feedbackData.description}
            onChange={(e) =>
              setFeedbackData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors",
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500"
            )}
            rows={4}
            placeholder={
              feedbackData.category === "bug"
                ? "Describe the bug, steps to reproduce, and expected vs actual behavior..."
                : feedbackData.category === "feature"
                ? "Describe the feature you'd like to see, why it would be useful, and how it should work..."
                : "Provide detailed information about your feedback..."
            }
            required
          />
        </div>

        {/* Severity */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Severity
          </label>
          <div className="flex gap-2">
            {SEVERITY_LEVELS.map((severity) => (
              <button
                key={severity.value}
                type="button"
                onClick={() =>
                  setFeedbackData((prev) => ({
                    ...prev,
                    severity: severity.value,
                  }))
                }
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  feedbackData.severity === severity.value
                    ? severity.color
                    : isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {severity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context (Optional) */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Additional Context
            <span
              className={cn(
                "text-xs font-normal ml-2",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              (Optional)
            </span>
          </label>
          <textarea
            value={feedbackData.context}
            onChange={(e) =>
              setFeedbackData((prev) => ({ ...prev, context: e.target.value }))
            }
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors",
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500"
            )}
            rows={2}
            placeholder="Browser version, operating system, error logs, screenshots, or any other relevant context..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-orange-500 to-amber-600 text-white",
              "hover:from-orange-600 hover:to-amber-700 hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

          <button
            type="button"
            onClick={() =>
              setFeedbackData({
                title: "",
                description: "",
                category: "bug",
                severity: "medium",
                context: data?.userContext || "",
              })
            }
            disabled={isSubmitting}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
