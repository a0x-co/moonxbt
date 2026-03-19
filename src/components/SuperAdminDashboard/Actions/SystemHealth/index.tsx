"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Clock,
  Activity,
  Database,
  Cloud,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime?: number;
  lastChecked: string;
  url?: string;
  details?: string;
}

interface SystemHealthData {
  overall: 'healthy' | 'warning' | 'critical';
  services: ServiceStatus[];
  uptime: {
    percentage: number;
    duration: string;
  };
  performance: {
    avgResponseTime: number;
    requests24h: number;
    errors24h: number;
  };
  infrastructure: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface SystemHealthProps {
  agentId: string;
  agentName: string;
  healthData?: SystemHealthData;
  isLoading?: boolean;
  isDark?: boolean;
  onRefresh?: () => Promise<void>;
  onServiceCheck?: (serviceName: string) => Promise<void>;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  agentId,
  agentName,
  healthData,
  isLoading = false,
  isDark = false,
  onRefresh,
  onServiceCheck,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingServices, setCheckingServices] = useState<Set<string>>(new Set());

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

  const handleServiceCheck = async (serviceName: string) => {
    setCheckingServices(prev => new Set(prev).add(serviceName));
    try {
      if (onServiceCheck) {
        await onServiceCheck(serviceName);
      }
    } finally {
      setCheckingServices(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceName);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200';
      case 'warning':
        return isDark ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200';
      default:
        return isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200';
    }
  };

  // Mock data for demonstration
  const mockHealthData: SystemHealthData = {
    overall: 'healthy',
    services: [
      {
        name: 'A0X Agent API',
        status: 'healthy',
        responseTime: 120,
        lastChecked: new Date().toISOString(),
        url: '/api/agents',
        details: 'All endpoints responding normally'
      },
      {
        name: 'Twitter Integration',
        status: 'healthy',
        responseTime: 250,
        lastChecked: new Date().toISOString(),
        details: 'Rate limits: 80% available'
      },
      {
        name: 'Farcaster Hub',
        status: 'warning',
        responseTime: 890,
        lastChecked: new Date().toISOString(),
        details: 'Elevated response times detected'
      },
      {
        name: 'BigQuery Analytics',
        status: 'healthy',
        responseTime: 450,
        lastChecked: new Date().toISOString(),
        details: 'Query performance optimal'
      },
      {
        name: 'Pinecone Vector DB',
        status: 'healthy',
        responseTime: 180,
        lastChecked: new Date().toISOString(),
        details: 'Index utilization: 45%'
      },
      {
        name: 'Memory Service (Zep)',
        status: 'critical',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        details: 'Connection timeout - investigating'
      }
    ],
    uptime: {
      percentage: 99.2,
      duration: '28 days, 14 hours'
    },
    performance: {
      avgResponseTime: 290,
      requests24h: 15247,
      errors24h: 23
    },
    infrastructure: {
      cpu: 45,
      memory: 62,
      storage: 28
    }
  };

  const displayData = healthData || mockHealthData;

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
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
              System Health Monitoring
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              {agentName} • Infrastructure Status
            </p>
          </div>
        </div>

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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Overall Status */}
          <div className={cn(
            "p-4 rounded-lg mb-6 border",
            getStatusBg(displayData.overall)
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getStatusIcon(displayData.overall), {
                  className: cn("w-6 h-6", getStatusColor(displayData.overall))
                })}
                <div>
                  <div className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                    System Status: {displayData.overall.charAt(0).toUpperCase() + displayData.overall.slice(1)}
                  </div>
                  <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                    {displayData.uptime.percentage}% uptime • {displayData.uptime.duration}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                  {displayData.performance.avgResponseTime}ms
                </div>
                <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  Avg Response
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                  Requests (24h)
                </span>
              </div>
              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {displayData.performance.requests24h.toLocaleString()}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                  Errors (24h)
                </span>
              </div>
              <div className={cn("text-2xl font-bold", displayData.performance.errors24h > 50 ? "text-red-500" : (isDark ? "text-white" : "text-gray-900"))}>
                {displayData.performance.errors24h}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Database className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                  Error Rate
                </span>
              </div>
              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {((displayData.performance.errors24h / displayData.performance.requests24h) * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Infrastructure Usage */}
          <div className={cn(
            "p-4 rounded-lg mb-6",
            isDark ? "bg-gray-700/30" : "bg-gray-50"
          )}>
            <h4 className={cn("font-medium mb-4", isDark ? "text-white" : "text-gray-900")}>
              Infrastructure Usage
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>CPU</span>
                  <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {displayData.infrastructure.cpu}%
                  </span>
                </div>
                <div className={cn("w-full bg-gray-200 rounded-full h-2", isDark && "bg-gray-600")}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${displayData.infrastructure.cpu}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>Memory</span>
                  <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {displayData.infrastructure.memory}%
                  </span>
                </div>
                <div className={cn("w-full bg-gray-200 rounded-full h-2", isDark && "bg-gray-600")}>
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${displayData.infrastructure.memory}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>Storage</span>
                  <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {displayData.infrastructure.storage}%
                  </span>
                </div>
                <div className={cn("w-full bg-gray-200 rounded-full h-2", isDark && "bg-gray-600")}>
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${displayData.infrastructure.storage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div>
            <h4 className={cn("font-medium mb-4", isDark ? "text-white" : "text-gray-900")}>
              Service Status
            </h4>
            <div className="space-y-3">
              {displayData.services.map((service, index) => {
                const StatusIcon = getStatusIcon(service.status);
                const isChecking = checkingServices.has(service.name);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-300",
                      getStatusBg(service.status)
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={cn("w-5 h-5", getStatusColor(service.status))} />
                        <div>
                          <div className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {service.name}
                          </div>
                          <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                            {service.details}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {service.responseTime !== undefined && service.responseTime > 0 && (
                          <div className="text-right">
                            <div className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                              {service.responseTime}ms
                            </div>
                            <div className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                              Response time
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleServiceCheck(service.name)}
                          disabled={isChecking}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            isDark
                              ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                              : "hover:bg-gray-200 text-gray-500 hover:text-gray-700",
                            "disabled:opacity-50"
                          )}
                        >
                          <RefreshCw className={cn("w-3 h-3", isChecking && "animate-spin")} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};