"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime?: number;
  lastCheck?: string;
  details?: string;
  uptime?: number;
}

interface SystemHealthData {
  overall: 'healthy' | 'warning' | 'error';
  services: ServiceStatus[];
  metrics: {
    totalServices: number;
    healthyServices: number;
    avgResponseTime: number;
    uptime: number;
  };
  lastUpdated: string;
}

interface InlineSystemHealthProps {
  data?: SystemHealthData;
  onRefresh?: () => Promise<SystemHealthData>;
  isLoading?: boolean;
  isDark?: boolean;
}

const STATUS_CONFIG = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'Healthy'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: 'Warning'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Error'
  },
  unknown: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    label: 'Unknown'
  }
} as const;

const MOCK_DATA: SystemHealthData = {
  overall: 'healthy',
  services: [
    {
      name: 'A0X Agent API',
      status: 'healthy',
      responseTime: 145,
      lastCheck: '2 minutes ago',
      uptime: 99.9,
      details: 'All endpoints responding normally'
    },
    {
      name: 'Twitter Collector',
      status: 'healthy',
      responseTime: 89,
      lastCheck: '1 minute ago',
      uptime: 99.7,
      details: 'Processing mentions and replies'
    },
    {
      name: 'Farcaster Executor',
      status: 'warning',
      responseTime: 324,
      lastCheck: '3 minutes ago',
      uptime: 98.5,
      details: 'Elevated response times detected'
    },
    {
      name: 'Telegram Webhook',
      status: 'healthy',
      responseTime: 67,
      lastCheck: '1 minute ago',
      uptime: 99.8,
      details: 'Webhook processing normally'
    },
    {
      name: 'Database (Firestore)',
      status: 'healthy',
      responseTime: 23,
      lastCheck: '30 seconds ago',
      uptime: 99.99,
      details: 'All collections accessible'
    },
    {
      name: 'Vector DB (Pinecone)',
      status: 'healthy',
      responseTime: 156,
      lastCheck: '2 minutes ago',
      uptime: 99.6,
      details: 'Knowledge base queries working'
    }
  ],
  metrics: {
    totalServices: 6,
    healthyServices: 5,
    avgResponseTime: 134,
    uptime: 99.4
  },
  lastUpdated: new Date().toISOString()
};

export function InlineSystemHealth({
  data = MOCK_DATA,
  onRefresh,
  isLoading = false,
  isDark = false,
}: InlineSystemHealthProps) {
  const [healthData, setHealthData] = useState<SystemHealthData>(data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      const newData = await onRefresh();
      setHealthData(newData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh && !isRefreshing) {
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh, isRefreshing]);

  const overallConfig = STATUS_CONFIG[healthData.overall];
  const OverallIcon = overallConfig.icon;

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
              Real-time status of all services and infrastructure
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isDark 
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Overall Status */}
      <div className={cn(
        "p-4 rounded-lg mb-6",
        overallConfig.bgColor,
        overallConfig.borderColor,
        "border"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OverallIcon className={cn("w-6 h-6", overallConfig.color)} />
            <div>
              <h4 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                System Status: {overallConfig.label}
              </h4>
              <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                {healthData.metrics.healthyServices} of {healthData.metrics.totalServices} services healthy
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn("text-lg font-bold", overallConfig.color)}>
              {healthData.metrics.uptime}%
            </div>
            <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
              Overall Uptime
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className={cn(
          "p-3 rounded-lg",
          isDark ? "bg-gray-700" : "bg-gray-50"
        )}>
          <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            {healthData.metrics.avgResponseTime}ms
          </div>
          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
            Avg Response Time
          </div>
        </div>
        
        <div className={cn(
          "p-3 rounded-lg",
          isDark ? "bg-gray-700" : "bg-gray-50"
        )}>
          <div className={cn("text-2xl font-bold text-green-500")}>
            {healthData.metrics.healthyServices}
          </div>
          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
            Healthy Services
          </div>
        </div>
        
        <div className={cn(
          "p-3 rounded-lg col-span-2 lg:col-span-1",
          isDark ? "bg-gray-700" : "bg-gray-50"
        )}>
          <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            {new Date(lastRefresh).toLocaleTimeString()}
          </div>
          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
            Last Updated
          </div>
        </div>
      </div>

      {/* Services List */}
      <div>
        <h4 className={cn("font-medium mb-3", isDark ? "text-gray-200" : "text-gray-700")}>
          Service Status ({healthData.services.length})
        </h4>
        
        <div className="space-y-3">
          {healthData.services.map((service, index) => {
            const config = STATUS_CONFIG[service.status];
            const StatusIcon = config.icon;
            
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn("w-5 h-5", config.color)} />
                    <div>
                      <h5 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {service.name}
                      </h5>
                      <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {service.details}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      {service.responseTime && (
                        <div className="text-right">
                          <div className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {service.responseTime}ms
                          </div>
                          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                            Response
                          </div>
                        </div>
                      )}
                      
                      {service.uptime && (
                        <div className="text-right">
                          <div className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {service.uptime}%
                          </div>
                          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                            Uptime
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {service.lastCheck && (
                      <div className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                        Checked {service.lastCheck}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "mt-6 pt-4 border-t text-center",
        isDark ? "border-gray-700" : "border-gray-200"
      )}>
        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
          Monitoring {healthData.services.length} services • Auto-refresh every 30s • 
          Last updated: {new Date(healthData.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}