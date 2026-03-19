"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  Activity,
  BarChart3,
  Clock,
  Cpu,
  Database,
  Globe,
  LineChart,
  MemoryStick,
  Monitor,
  RefreshCw,
  Server,
  TrendingUp,
  Wifi,
  Zap,
  Eye,
  Target,
  Gauge,
  HardDrive,
  Network,
  Timer,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
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
  TabsTrigger 
} from "@/components/shadcn/tabs";
import { Badge } from "@/components/shadcn/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface PerformanceDashboardProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Generador de métricas en tiempo real
const generateRealtimeMetrics = () => {
  const baseTime = Date.now();
  const metrics = [];
  
  for (let i = 59; i >= 0; i--) {
    const timestamp = new Date(baseTime - i * 1000);
    metrics.push({
      timestamp,
      responseTime: Math.random() * 2000 + 500, // 500-2500ms
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 1000 + 100),
      requestsPerSecond: Math.random() * 50 + 10,
      errorRate: Math.random() * 5, // 0-5%
      uptime: 99.9 - Math.random() * 0.1
    });
  }
  
  return metrics;
};

// Sistema de salud de componentes
const componentHealth = [
  {
    name: "Conversation Engine",
    status: "healthy",
    responseTime: 145,
    lastCheck: new Date(),
    uptime: 99.98,
    details: "All conversation processing systems operational"
  },
  {
    name: "Memory System",
    status: "healthy", 
    responseTime: 89,
    lastCheck: new Date(),
    uptime: 99.95,
    details: "Vector database and memory retrieval optimal"
  },
  {
    name: "Knowledge Base",
    status: "warning",
    responseTime: 234,
    lastCheck: new Date(),
    uptime: 99.87,
    details: "Slight delay in knowledge retrieval, investigating"
  },
  {
    name: "LLM Providers",
    status: "healthy",
    responseTime: 1250,
    lastCheck: new Date(),
    uptime: 99.92,
    details: "All language model providers responding normally"
  },
  {
    name: "Social Platforms",
    status: "degraded",
    responseTime: 2100,
    lastCheck: new Date(),
    uptime: 98.45,
    details: "Twitter API experiencing intermittent slowdowns"
  },
  {
    name: "Database",
    status: "healthy",
    responseTime: 12,
    lastCheck: new Date(),
    uptime: 99.99,
    details: "Database queries executing within normal parameters"
  }
];

const statusConfig = {
  healthy: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
    label: "Healthy"
  },
  warning: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200", 
    icon: AlertCircle,
    label: "Warning"
  },
  degraded: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: AlertCircle,
    label: "Degraded"
  }
};

/**
 * PerformanceDashboard - Dashboard avanzado de métricas de rendimiento en tiempo real
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(generateRealtimeMetrics());
  const [timeRange, setTimeRange] = useState("1m");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("responseTime");
  const { toast } = useToast();

  // Actualización en tiempo real de métricas
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetric = {
          timestamp: new Date(),
          responseTime: Math.random() * 2000 + 500,
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          activeConnections: Math.floor(Math.random() * 1000 + 100),
          requestsPerSecond: Math.random() * 50 + 10,
          errorRate: Math.random() * 5,
          uptime: 99.9 - Math.random() * 0.1
        };
        
        // Mantener solo los últimos 60 puntos de datos
        const updated = [...prev.slice(1), newMetric];
        return updated;
      });
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Cálculos de métricas actuales
  const currentMetrics = useMemo(() => {
    if (metrics.length === 0) return null;
    
    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];
    
    const calculateTrend = (current: number, prev: number) => {
      if (!prev) return 'stable';
      const change = ((current - prev) / prev) * 100;
      if (Math.abs(change) < 1) return 'stable';
      return change > 0 ? 'up' : 'down';
    };
    
    return {
      responseTime: {
        value: latest.responseTime,
        trend: calculateTrend(latest.responseTime, previous?.responseTime || 0),
        change: previous ? ((latest.responseTime - previous.responseTime) / previous.responseTime * 100) : 0
      },
      cpuUsage: {
        value: latest.cpuUsage,
        trend: calculateTrend(latest.cpuUsage, previous?.cpuUsage || 0),
        change: previous ? ((latest.cpuUsage - previous.cpuUsage) / previous.cpuUsage * 100) : 0
      },
      memoryUsage: {
        value: latest.memoryUsage,
        trend: calculateTrend(latest.memoryUsage, previous?.memoryUsage || 0),
        change: previous ? ((latest.memoryUsage - previous.memoryUsage) / previous.memoryUsage * 100) : 0
      },
      requestsPerSecond: {
        value: latest.requestsPerSecond,
        trend: calculateTrend(latest.requestsPerSecond, previous?.requestsPerSecond || 0),
        change: previous ? ((latest.requestsPerSecond - previous.requestsPerSecond) / previous.requestsPerSecond * 100) : 0
      },
      errorRate: {
        value: latest.errorRate,
        trend: calculateTrend(latest.errorRate, previous?.errorRate || 0),
        change: previous ? ((latest.errorRate - previous.errorRate) / previous.errorRate * 100) : 0
      },
      uptime: {
        value: latest.uptime,
        trend: calculateTrend(latest.uptime, previous?.uptime || 0),
        change: previous ? ((latest.uptime - previous.uptime) / previous.uptime * 100) : 0
      }
    };
  }, [metrics]);

  const handleRefreshMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      if (onAction) {
        await onAction('refresh-performance-metrics', {
          agentId: agent.agentId || agent.id,
          includeSystemMetrics: true,
          includeComponentHealth: true
        });
      }
      
      // Simular nueva carga de datos
      setMetrics(generateRealtimeMetrics());
      
      toast({
        title: "Metrics refreshed",
        description: "Performance metrics have been updated with latest data",
      });
      
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh performance metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onAction, agent, toast]);

  const TrendIcon = ({ trend, className }: { trend: string, className?: string }) => {
    switch (trend) {
      case 'up': return <ArrowUp className={cn("w-3 h-3", className)} />;
      case 'down': return <ArrowDown className={cn("w-3 h-3", className)} />;
      default: return <Minus className={cn("w-3 h-3", className)} />;
    }
  };

  const getTrendColor = (trend: string, isGoodWhenUp: boolean = true) => {
    if (trend === 'stable') return 'text-gray-500';
    const isPositive = isGoodWhenUp ? trend === 'up' : trend === 'down';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  if (!currentMetrics) {
    return (
      <AdminContainer title="Performance Dashboard" subtitle="Loading metrics...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer
      title="Performance Dashboard"
      subtitle="Real-time system metrics and performance monitoring"
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              autoRefresh ? "bg-green-400 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-xs text-gray-600">
              {autoRefresh ? "Live" : "Paused"}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs"
          >
            {autoRefresh ? "Pause" : "Resume"}
          </Button>
          
          <Button
            onClick={handleRefreshMetrics}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Métricas principales en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.responseTime.trend, false)
              )}>
                <TrendIcon trend={currentMetrics.responseTime.trend} />
                <span>{Math.abs(currentMetrics.responseTime.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round(currentMetrics.responseTime.value)}ms
            </div>
            <div className="text-xs text-blue-600">Response Time</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-green-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.cpuUsage.trend, false)
              )}>
                <TrendIcon trend={currentMetrics.cpuUsage.trend} />
                <span>{Math.abs(currentMetrics.cpuUsage.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {Math.round(currentMetrics.cpuUsage.value)}%
            </div>
            <div className="text-xs text-green-600">CPU Usage</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <MemoryStick className="w-5 h-5 text-purple-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.memoryUsage.trend, false)
              )}>
                <TrendIcon trend={currentMetrics.memoryUsage.trend} />
                <span>{Math.abs(currentMetrics.memoryUsage.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {Math.round(currentMetrics.memoryUsage.value)}%
            </div>
            <div className="text-xs text-purple-600">Memory</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.requestsPerSecond.trend, true)
              )}>
                <TrendIcon trend={currentMetrics.requestsPerSecond.trend} />
                <span>{Math.abs(currentMetrics.requestsPerSecond.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {Math.round(currentMetrics.requestsPerSecond.value)}
            </div>
            <div className="text-xs text-amber-600">Req/sec</div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.errorRate.trend, false)
              )}>
                <TrendIcon trend={currentMetrics.errorRate.trend} />
                <span>{Math.abs(currentMetrics.errorRate.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {currentMetrics.errorRate.value.toFixed(2)}%
            </div>
            <div className="text-xs text-red-600">Error Rate</div>
          </div>

          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              <div className={cn(
                "flex items-center gap-1 text-xs",
                getTrendColor(currentMetrics.uptime.trend, true)
              )}>
                <TrendIcon trend={currentMetrics.uptime.trend} />
                <span>{Math.abs(currentMetrics.uptime.change).toFixed(3)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-900">
              {currentMetrics.uptime.value.toFixed(2)}%
            </div>
            <div className="text-xs text-cyan-600">Uptime</div>
          </div>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Real-time Charts
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Component Health
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Network & API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <div className="space-y-4">
              {/* Gráfico principal simulado */}
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Performance Metrics (Last 60 seconds)
                  </h3>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responseTime">Response Time</SelectItem>
                      <SelectItem value="cpuUsage">CPU Usage</SelectItem>
                      <SelectItem value="memoryUsage">Memory Usage</SelectItem>
                      <SelectItem value="requestsPerSecond">Requests/sec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Placeholder para gráfico real */}
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Real-time Chart Visualization</p>
                    <p className="text-sm text-gray-500">
                      Showing {selectedMetric} over time
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Current Value: {
                          selectedMetric === 'responseTime' ? `${Math.round(currentMetrics.responseTime.value)}ms` :
                          selectedMetric === 'cpuUsage' ? `${Math.round(currentMetrics.cpuUsage.value)}%` :
                          selectedMetric === 'memoryUsage' ? `${Math.round(currentMetrics.memoryUsage.value)}%` :
                          `${Math.round(currentMetrics.requestsPerSecond.value)}/sec`
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">System Load</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">1 min avg</span>
                      <span className="font-medium">
                        {(currentMetrics.cpuUsage.value * 0.01).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">5 min avg</span>
                      <span className="font-medium">
                        {(currentMetrics.cpuUsage.value * 0.008).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">15 min avg</span>
                      <span className="font-medium">
                        {(currentMetrics.cpuUsage.value * 0.007).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Memory Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="font-medium">
                        {(currentMetrics.memoryUsage.value * 0.08).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Free</span>
                      <span className="font-medium">
                        {(8 - currentMetrics.memoryUsage.value * 0.08).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="font-medium">8.0 GB</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Request Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total today</span>
                      <span className="font-medium">
                        {Math.floor(currentMetrics.requestsPerSecond.value * 86400)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Peak RPS</span>
                      <span className="font-medium">
                        {Math.round(currentMetrics.requestsPerSecond.value * 1.5)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg RPS</span>
                      <span className="font-medium">
                        {Math.round(currentMetrics.requestsPerSecond.value * 0.8)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="components">
            <div className="space-y-4">
              {componentHealth.map((component) => {
                const statusInfo = statusConfig[component.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={component.name}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border",
                          statusInfo.color
                        )}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {component.name}
                            </h4>
                            <Badge className={cn("text-xs", statusInfo.color)}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {component.details}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {component.responseTime}ms
                          </span>
                          <span>
                            <Activity className="w-3 h-3 inline mr-1" />
                            {component.uptime}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last check: {component.lastCheck.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
                <div className="space-y-3">
                  {[
                    { endpoint: "/api/chat", status: "healthy", latency: 145, requests: 1240 },
                    { endpoint: "/api/memory", status: "healthy", latency: 89, requests: 890 },
                    { endpoint: "/api/knowledge", status: "warning", latency: 234, requests: 456 },
                    { endpoint: "/api/webhooks", status: "healthy", latency: 67, requests: 2100 }
                  ].map((api) => (
                    <div key={api.endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          api.status === 'healthy' ? "bg-green-400" : "bg-yellow-400"
                        )} />
                        <span className="font-mono text-sm">{api.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{api.latency}ms</span>
                        <span>{api.requests} req/h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">External Services</h3>
                <div className="space-y-3">
                  {[
                    { service: "OpenAI API", status: "healthy", latency: 850, success: 99.8 },
                    { service: "Anthropic API", status: "healthy", latency: 720, success: 99.9 },
                    { service: "Twitter API", status: "degraded", latency: 2100, success: 98.2 },
                    { service: "Farcaster Hub", status: "healthy", latency: 450, success: 99.5 }
                  ].map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          service.status === 'healthy' ? "bg-green-400" : "bg-red-400"
                        )} />
                        <span className="text-sm">{service.service}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{service.latency}ms</span>
                        <span>{service.success}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminContainer>
  );
};