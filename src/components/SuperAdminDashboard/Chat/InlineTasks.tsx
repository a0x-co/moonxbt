"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Plus,
  Settings
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

interface InlineTasksProps {
  data?: {
    tasks?: any[];
    schedule?: any[];
    completed?: number;
    pending?: number;
  };
  compact?: boolean;
}

/**
 * InlineTasks - Versión compacta del TaskScheduler para chat
 */
export const InlineTasks: React.FC<InlineTasksProps> = ({
  data,
  compact = true
}) => {
  // Mock data si no se proporciona
  const mockData = {
    completed: 23,
    pending: 8,
    tasks: [
      {
        id: "task_1",
        name: "Daily Analytics Report",
        type: "recurring",
        status: "active",
        schedule: "Every day at 9:00 AM",
        nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        success: true,
        priority: "medium"
      },
      {
        id: "task_2",
        name: "Conversation Backup",
        type: "recurring", 
        status: "active",
        schedule: "Every 6 hours",
        nextRun: new Date(Date.now() + 3 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000),
        success: true,
        priority: "high"
      },
      {
        id: "task_3",
        name: "Performance Cleanup",
        type: "manual",
        status: "pending",
        schedule: "On demand",
        nextRun: null,
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        success: false,
        priority: "low"
      },
      {
        id: "task_4",
        name: "Knowledge Base Update",
        type: "scheduled",
        status: "running",
        schedule: "Weekly on Sunday",
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        success: true,
        priority: "high"
      }
    ]
  };

  const taskData = { ...mockData, ...data };

  const statusConfig = {
    active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    running: { color: "bg-blue-100 text-blue-800", icon: PlayCircle },
    paused: { color: "bg-gray-100 text-gray-800", icon: PauseCircle },
    failed: { color: "bg-red-100 text-red-800", icon: AlertCircle }
  };

  const priorityConfig = {
    high: { color: "bg-red-100 text-red-800", label: "High" },
    medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
    low: { color: "bg-green-100 text-green-800", label: "Low" }
  };

  const typeConfig = {
    recurring: "🔄",
    scheduled: "📅", 
    manual: "👤"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Task Scheduler</h3>
              <p className="text-xs text-gray-600">{taskData.completed + taskData.pending} total tasks</p>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Task Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Completed</span>
            </div>
            <div className="text-lg font-bold text-green-900">{taskData.completed}</div>
            <div className="text-xs text-green-600">This week</div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Pending</span>
            </div>
            <div className="text-lg font-bold text-yellow-900">{taskData.pending}</div>
            <div className="text-xs text-yellow-600">In queue</div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-indigo-600" />
            Active Tasks
          </h4>
          
          <div className="space-y-2">
            {taskData.tasks.slice(0, compact ? 4 : 6).map((task) => {
              const statusInfo = statusConfig[task.status as keyof typeof statusConfig];
              const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg border hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{typeConfig[task.type as keyof typeof typeConfig]}</span>
                      <span className="font-medium text-gray-900 text-sm">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={cn("text-xs", priorityInfo.color)}>
                        {priorityInfo.label}
                      </Badge>
                      <Badge className={cn("text-xs", statusInfo.color)}>
                        <StatusIcon className="w-2 h-2 mr-1" />
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Schedule:</span> {task.schedule}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {task.nextRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Next: {task.nextRun.toLocaleTimeString()}
                        </span>
                      )}
                      {task.lastRun && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className={cn(
                            "w-3 h-3",
                            task.success ? "text-green-500" : "text-red-500"
                          )} />
                          Last: {task.lastRun.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Quick Actions</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="text-xs h-8">
              <PlayCircle className="w-3 h-3 mr-1" />
              Run Analytics
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-8">
              <Settings className="w-3 h-3 mr-1" />
              Cleanup Logs
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-8">
              <Calendar className="w-3 h-3 mr-1" />
              Backup Data
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-8">
              <CheckCircle className="w-3 h-3 mr-1" />
              Health Check
            </Button>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Next 24 Hours
          </h4>
          
          <div className="space-y-2">
            {taskData.tasks
              .filter(task => task.nextRun && task.nextRun.getTime() - Date.now() <= 24 * 60 * 60 * 1000)
              .slice(0, 3)
              .map((task) => (
                <div key={task.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{task.name}</span>
                  <span className="text-blue-600 font-medium">
                    {task.nextRun?.toLocaleTimeString()}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            View Schedule
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Manage Tasks
          </Button>
        </div>

        {/* System Status */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          ⚡ Task scheduler running smoothly • Next check in 5 minutes
        </div>
      </div>
    </div>
  );
};