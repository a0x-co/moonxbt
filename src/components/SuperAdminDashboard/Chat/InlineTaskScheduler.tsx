"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskData {
  name: string;
  description: string;
  schedule: string; // cron expression
  type: "tweet" | "reply" | "analysis" | "maintenance" | "custom";
  priority: "low" | "medium" | "high";
  enabled: boolean;
}

interface InlineTaskSchedulerProps {
  data?: {
    availableTypes?: string[];
    existingTasks?: TaskData[];
  };
  onSchedule?: (task: TaskData) => Promise<void>;
  isLoading?: boolean;
  isDark?: boolean;
}

const TASK_TYPES = [
  { value: "tweet", label: "Scheduled Tweet", icon: "🐦" },
  { value: "reply", label: "Auto Reply", icon: "💬" },
  { value: "analysis", label: "Analytics Report", icon: "📊" },
  { value: "maintenance", label: "System Maintenance", icon: "🔧" },
  { value: "custom", label: "Custom Task", icon: "⚙️" },
];

const SCHEDULE_PRESETS = [
  { label: "Every Hour", value: "0 * * * *" },
  { label: "Every 6 Hours", value: "0 */6 * * *" },
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Daily at 6 PM", value: "0 18 * * *" },
  { label: "Weekly (Mondays)", value: "0 9 * * 1" },
  { label: "Monthly (1st)", value: "0 9 1 * *" },
];

export function InlineTaskScheduler({
  data,
  onSchedule,
  isLoading = false,
  isDark = false,
}: InlineTaskSchedulerProps) {
  const [taskData, setTaskData] = useState<TaskData>({
    name: "",
    description: "",
    schedule: "0 9 * * *", // Daily at 9 AM default
    type: "tweet",
    priority: "medium",
    enabled: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSchedule) return;

    // Basic validation
    if (!taskData.name.trim() || !taskData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSchedule(taskData);
      setSuccess(true);

      // Reset form
      setTaskData({
        name: "",
        description: "",
        schedule: "0 9 * * *",
        type: "tweet",
        priority: "medium",
        enabled: true,
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setTaskData((prev) => ({ ...prev, schedule: preset }));
    setShowPresets(false);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3
            className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Schedule Administrative Task
          </h3>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Create automated jobs and workflows
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
          <span className="text-sm">Task scheduled successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Task Name *
          </label>
          <input
            type="text"
            value={taskData.name}
            onChange={(e) =>
              setTaskData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={cn(
              "w-full p-3 rounded-lg border transition-colors",
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            )}
            placeholder="Enter task name..."
            required
          />
        </div>

        {/* Task Description */}
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
            value={taskData.description}
            onChange={(e) =>
              setTaskData((prev) => ({ ...prev, description: e.target.value }))
            }
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors",
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            )}
            rows={2}
            placeholder="Describe what this task will do..."
            required
          />
        </div>

        {/* Task Type and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Task Type */}
          <div>
            <label
              className={cn(
                "block text-sm font-medium mb-2",
                isDark ? "text-gray-200" : "text-gray-700"
              )}
            >
              Task Type
            </label>
            <select
              value={taskData.type}
              onChange={(e) =>
                setTaskData((prev) => ({
                  ...prev,
                  type: e.target.value as TaskData["type"],
                }))
              }
              className={cn(
                "w-full p-3 rounded-lg border transition-colors",
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              )}
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              className={cn(
                "block text-sm font-medium mb-2",
                isDark ? "text-gray-200" : "text-gray-700"
              )}
            >
              Priority
            </label>
            <select
              value={taskData.priority}
              onChange={(e) =>
                setTaskData((prev) => ({
                  ...prev,
                  priority: e.target.value as TaskData["priority"],
                }))
              }
              className={cn(
                "w-full p-3 rounded-lg border transition-colors",
                isDark
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              )}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Schedule (Cron Expression)
          </label>

          {/* Schedule Input with Presets Button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={taskData.schedule}
              onChange={(e) =>
                setTaskData((prev) => ({ ...prev, schedule: e.target.value }))
              }
              className={cn(
                "flex-1 p-3 rounded-lg border transition-colors font-mono text-sm",
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              )}
              placeholder="0 9 * * * (Daily at 9 AM)"
            />
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className={cn(
                "px-3 py-2 rounded-lg border transition-colors",
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
              )}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule Presets */}
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={cn(
                "mt-2 p-3 rounded-lg border",
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium mb-2",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}
              >
                Quick Presets:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SCHEDULE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className={cn(
                      "text-left p-2 rounded text-sm transition-colors",
                      isDark
                        ? "hover:bg-gray-600 text-gray-300"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div
                      className={cn(
                        "text-xs font-mono",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      {preset.value}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <p
            className={cn(
              "text-xs mt-1",
              isDark ? "text-gray-400" : "text-gray-500"
            )}
          >
            Format: minute hour day month weekday (e.g., &quot;0 9 * * *&quot;
            for daily at 9 AM)
          </p>
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="task-enabled"
            checked={taskData.enabled}
            onChange={(e) =>
              setTaskData((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="task-enabled"
            className={cn(
              "text-sm font-medium",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Enable task immediately after creation
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
              "hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isSubmitting ? "Scheduling..." : "Schedule Task"}
          </button>
        </div>
      </form>

      {/* Existing Tasks Preview */}
      {data?.existingTasks && data.existingTasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4
            className={cn(
              "font-medium mb-3",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            Recent Tasks ({data.existingTasks.length})
          </h4>
          <div className="space-y-2">
            {data.existingTasks.slice(0, 3).map((task, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border",
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{task.name}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        task.enabled
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}
                    >
                      {task.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {task.schedule}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
