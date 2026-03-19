"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  Settings,
  Timer,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

interface TaskSchedulerProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// API endpoints for scheduled tasks
const API_ENDPOINTS = {
  tasks: "/api/scheduled-tasks",
  taskActions: "/api/scheduled-tasks/actions",
  createTask: "/api/scheduled-tasks",
};

// Task interface based on backend structure
interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule: string;
  status: "active" | "paused" | "error" | "disabled";
  lastRun: Date | null;
  nextRun: Date | null;
  priority: "low" | "medium" | "high";
  executionTime: number;
  successRate: number;
  parameters: Record<string, any>;
  createdAt: Date;
  agentId?: string;
}

const taskTypeConfig = {
  report_generation: {
    label: "Report Generation",
    color: "bg-blue-100 text-blue-800",
    icon: Activity,
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-green-100 text-green-800",
    icon: Settings,
  },
  monitoring: {
    label: "Monitoring",
    color: "bg-purple-100 text-purple-800",
    icon: Activity,
  },
  backup: {
    label: "Backup",
    color: "bg-orange-100 text-orange-800",
    icon: RefreshCw,
  },
};

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  paused: {
    label: "Paused",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Pause,
  },
  error: {
    label: "Error",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
  disabled: {
    label: "Disabled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Square,
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-green-600" },
  medium: { label: "Medium", color: "text-yellow-600" },
  high: { label: "High", color: "text-red-600" },
};

/**
 * TaskScheduler - Programador avanzado de tareas administrativas
 * Siguiendo patrones de TwitterScheduledPosts.tsx
 */
export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nextRun");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real data state
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);

  // New task form state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    type: "",
    schedule: "",
    priority: "medium" as "low" | "medium" | "high",
    parameters: "{}",
  });

  const itemsPerPage = 10;

  // API functions
  const fetchTasks = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      setError(null);

      const response = await fetch(
        `${API_ENDPOINTS.tasks}?agentId=${agent.agentId || agent.id}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data = await response.json();
      // Parse dates from strings to Date objects
      const parsedTasks = data.map((task: any) => ({
        ...task,
        lastRun: task.lastRun ? new Date(task.lastRun) : null,
        nextRun: task.nextRun ? new Date(task.nextRun) : null,
        createdAt: new Date(task.createdAt),
      }));

      setTasks(parsedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tasks"
      );
    } finally {
      setIsInitialLoading(false);
    }
  }, [agent.agentId, agent.id]);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filtering logic optimizado
  const searchLower = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search query - optimizado
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((task) => task.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nextRun":
          if (!a.nextRun && !b.nextRun) return 0;
          if (!a.nextRun) return 1;
          if (!b.nextRun) return -1;
          return a.nextRun.getTime() - b.nextRun.getTime();
        case "lastRun":
          if (!a.lastRun && !b.lastRun) return 0;
          if (!a.lastRun) return 1;
          if (!b.lastRun) return -1;
          return b.lastRun.getTime() - a.lastRun.getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchLower, selectedType, selectedStatus, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics - siguiendo patrón de metrics del dashboard
  const analytics = useMemo(() => {
    const total = filteredTasks.length;
    const active = filteredTasks.filter((t) => t.status === "active").length;
    const avgSuccessRate =
      total > 0
        ? filteredTasks.reduce((sum, task) => sum + task.successRate, 0) / total
        : 0;
    const totalExecutionTime = filteredTasks.reduce(
      (sum, task) => sum + task.executionTime,
      0
    );

    return {
      total,
      active,
      avgSuccessRate,
      totalExecutionTime,
    };
  }, [filteredTasks]);

  const handleTaskAction = useCallback(
    async (taskId: string, action: "start" | "pause" | "stop" | "run_now") => {
      setIsLoading(true);
      try {
        setError(null);

        const response = await fetch(API_ENDPOINTS.taskActions, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId,
            action,
            agentId: agent.agentId || agent.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to execute action: ${response.statusText}`);
        }

        // Refresh tasks after action
        await fetchTasks();

        if (onAction) {
          await onAction("schedule-admin-task", {
            taskId,
            action,
            agentId: agent.agentId || agent.id,
          });
        }
      } catch (error) {
        console.error("Error executing task action:", error);
        setError(
          error instanceof Error ? error.message : "Failed to execute action"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onAction, agent, fetchTasks]
  );

  const handleCreateTask = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validar JSON de parámetros antes de enviar
      let parsedParameters = {};
      try {
        parsedParameters = JSON.parse(newTask.parameters || "{}");
      } catch (jsonError) {
        console.error("Invalid JSON in parameters:", jsonError);
        // TODO: Mostrar error de validación al usuario
        return;
      }

      if (onAction) {
        await onAction("create-scheduled-task", {
          ...newTask,
          parameters: parsedParameters,
          agentId: agent.agentId || agent.id,
        });
      }

      // Reset form
      setNewTask({
        name: "",
        description: "",
        type: "",
        schedule: "",
        priority: "medium" as const,
        parameters: "{}",
      });

      setIsCreateModalOpen(false);

      // Refresh tasks after creation
      await fetchTasks();

      if (onAction) {
        await onAction("create-scheduled-task", {
          ...newTask,
          parameters: parsedParameters,
          agentId: agent.agentId || agent.id,
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create task"
      );
    } finally {
      setIsLoading(false);
    }
  }, [onAction, newTask, agent, fetchTasks]);

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return "Not scheduled";

    const now = new Date();
    const diffInMinutes = Math.floor(
      (timestamp.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 0) {
      const absDiff = Math.abs(diffInMinutes);
      if (absDiff < 60) return `${absDiff}m ago`;
      if (absDiff < 1440) return `${Math.floor(absDiff / 60)}h ago`;
      return `${Math.floor(absDiff / 1440)}d ago`;
    }

    if (diffInMinutes < 60) return `In ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `In ${Math.floor(diffInMinutes / 60)}h`;

    return timestamp.toLocaleDateString();
  };

  const parseCronExpression = useCallback((cron: string) => {
    // Comprehensive cron parser for display purposes
    const patterns: Record<string, string> = {
      "0 */6 * * *": "Every 6 hours",
      "0 9 * * 1": "Every Monday at 9:00 AM",
      "0 0 * * *": "Daily at midnight",
      "0 2 * * 0": "Every Sunday at 2:00 AM",
      "*/15 * * * *": "Every 15 minutes",
      "0 1 * * *": "Daily at 1:00 AM",
      "0 0 1 * *": "Monthly on the 1st",
      "0 9 * * 1-5": "Weekdays at 9:00 AM",
      "0 18 * * 1-5": "Weekdays at 6:00 PM",
      "0 12 * * 0,6": "Weekends at noon",
      "0 */4 * * *": "Every 4 hours",
      "0 */12 * * *": "Every 12 hours",
      "0 0 */2 * *": "Every 2 days at midnight",
    };

    return patterns[cron] || cron;
  }, []);

  return (
    <AdminContainer
      title="Task Scheduler"
      subtitle={`Managing ${analytics.total} automated tasks with ${analytics.active} currently active`}
      isLoading={isInitialLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchTasks}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Task
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error: {error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 border-red-200 hover:bg-red-50"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Analytics Overview - siguiendo patrón de stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Total Tasks
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.total}
            </div>
            <div className="text-xs text-blue-600">Scheduled</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {analytics.active}
            </div>
            <div className="text-xs text-green-600">Running</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Success Rate
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {analytics.avgSuccessRate.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">Average</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Exec Time
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {Math.round(analytics.totalExecutionTime / analytics.total || 0)}s
            </div>
            <div className="text-xs text-amber-600">Average</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="task-search" className="sr-only">
              Search scheduled tasks
            </label>
            <Input
              id="task-search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
              aria-label="Search tasks"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="report_generation">Reports</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="backup">Backup</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextRun">Next Run</SelectItem>
              <SelectItem value="lastRun">Last Run</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List - siguiendo patrón de TwitterScheduledPosts */}
        {paginatedTasks.length === 0 && !isInitialLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters or search terms"
                : "Create your first scheduled task to get started"}
            </p>
            {!searchQuery &&
              selectedType === "all" &&
              selectedStatus === "all" && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Task
                </Button>
              )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTasks.map((task) => {
              const typeInfo =
                taskTypeConfig[task.type as keyof typeof taskTypeConfig];
              const statusInfo =
                statusConfig[task.status as keyof typeof statusConfig];
              const priorityInfo =
                priorityConfig[task.priority as keyof typeof priorityConfig];
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={task.id}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Type Icon */}
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-gray-700" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {task.name}
                          </h4>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              typeInfo.color
                            )}
                          >
                            {typeInfo.label}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border",
                              statusInfo.color
                            )}
                          >
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Next: {formatTimestamp(task.nextRun)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            <span>{parseCronExpression(task.schedule)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{task.successRate}% success</span>
                          </div>

                          <div
                            className={cn(
                              "flex items-center gap-1 font-medium",
                              priorityInfo.color
                            )}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{priorityInfo.label} priority</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskAction(task.id, "pause")}
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          aria-label={`Pause task ${task.name}`}
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                      )}

                      {task.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskAction(task.id, "start")}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          aria-label={`Start task ${task.name}`}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTaskAction(task.id, "run_now")}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        aria-label={`Run task ${task.name} now`}
                      >
                        <Zap className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        aria-label={`Edit task ${task.name}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
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

      {/* Task Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Task Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedTask.name}
                    </div>
                    <div>
                      <strong>Type:</strong>{" "}
                      {
                        taskTypeConfig[
                          selectedTask.type as keyof typeof taskTypeConfig
                        ]?.label
                      }
                    </div>
                    <div>
                      <strong>Priority:</strong> {selectedTask.priority}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {
                        statusConfig[
                          selectedTask.status as keyof typeof statusConfig
                        ]?.label
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Schedule Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Schedule:</strong>{" "}
                      {parseCronExpression(selectedTask.schedule)}
                    </div>
                    <div>
                      <strong>Last Run:</strong>{" "}
                      {formatTimestamp(selectedTask.lastRun)}
                    </div>
                    <div>
                      <strong>Next Run:</strong>{" "}
                      {formatTimestamp(selectedTask.nextRun)}
                    </div>
                    <div>
                      <strong>Success Rate:</strong> {selectedTask.successRate}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedTask.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Parameters
                </h4>
                <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedTask.parameters, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Task Name
                </label>
                <Input
                  placeholder="Enter task name"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Task Type
                </label>
                <Select
                  value={newTask.type}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report_generation">
                      Report Generation
                    </SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Describe what this task does..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Schedule
                </label>
                <Select
                  value={newTask.schedule}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      // Reset to empty for custom input
                      setNewTask({ ...newTask, schedule: "" });
                    } else {
                      setNewTask({ ...newTask, schedule: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 */6 * * *">Every 6 hours</SelectItem>
                    <SelectItem value="0 9 * * 1">
                      Every Monday at 9:00 AM
                    </SelectItem>
                    <SelectItem value="0 0 * * *">Daily at midnight</SelectItem>
                    <SelectItem value="0 2 * * 0">
                      Every Sunday at 2:00 AM
                    </SelectItem>
                    <SelectItem value="*/15 * * * *">
                      Every 15 minutes
                    </SelectItem>
                    <SelectItem value="0 1 * * *">Daily at 1:00 AM</SelectItem>
                    <SelectItem value="0 0 1 * *">
                      Monthly on the 1st
                    </SelectItem>
                    <SelectItem value="0 9 * * 1-5">
                      Weekdays at 9:00 AM
                    </SelectItem>
                    <SelectItem value="0 18 * * 1-5">
                      Weekdays at 6:00 PM
                    </SelectItem>
                    <SelectItem value="0 12 * * 0,6">
                      Weekends at noon
                    </SelectItem>
                    <SelectItem value="0 */4 * * *">Every 4 hours</SelectItem>
                    <SelectItem value="0 */12 * * *">Every 12 hours</SelectItem>
                    <SelectItem value="0 0 */2 * *">
                      Every 2 days at midnight
                    </SelectItem>
                    <SelectItem value="custom">Custom schedule...</SelectItem>
                  </SelectContent>
                </Select>

                {newTask.schedule === "" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter custom cron format (e.g., 0 */6 * * *)"
                      value={newTask.schedule}
                      onChange={(e) =>
                        setNewTask({ ...newTask, schedule: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Custom format: &quot;0 */6 * * *&quot; = every 6 hours,
                      &quot;0 9 * * 1&quot; = every Monday at 9 AM
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({
                      ...newTask,
                      priority: value as "medium",
                    })
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
                Parameters (JSON)
              </label>
              <Textarea
                placeholder='{"key": "value"}'
                value={newTask.parameters}
                onChange={(e) =>
                  setNewTask({ ...newTask, parameters: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={
                  !newTask.name ||
                  !newTask.type ||
                  !newTask.schedule ||
                  isLoading
                }
              >
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
};
