"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Settings,
  Smartphone,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Switch } from "@/components/shadcn/switch";
import { Badge } from "@/components/shadcn/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface AlertsManagerProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Configuración de tipos de alertas
const alertTypes = {
  performance: {
    label: "Performance",
    icon: TrendingUp,
    color: "blue",
    description: "Response times, uptime, and system performance"
  },
  conversations: {
    label: "Conversations",
    icon: MessageSquare,
    color: "green",
    description: "Volume spikes, unusual patterns, engagement drops"
  },
  sentiment: {
    label: "Sentiment",
    icon: Users,
    color: "purple",
    description: "User satisfaction, feedback scores, mood changes"
  },
  errors: {
    label: "Errors",
    icon: AlertTriangle,
    color: "red",
    description: "System errors, failed responses, critical issues"
  },
  security: {
    label: "Security",
    icon: Eye,
    color: "orange",
    description: "Unusual access patterns, potential threats"
  }
};

const severityLevels = {
  low: { label: "Low", color: "bg-green-100 text-green-800 border-green-200" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  high: { label: "High", color: "bg-orange-100 text-orange-800 border-orange-200" },
  critical: { label: "Critical", color: "bg-red-100 text-red-800 border-red-200" }
};

// Mock data de alertas activas
const mockActiveAlerts = [
  {
    id: "alert_1",
    name: "Response Time Spike",
    type: "performance",
    severity: "medium",
    isActive: true,
    triggered: false,
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    condition: "avg_response_time > 2000ms",
    threshold: "2000ms",
    currentValue: "1850ms",
    notificationChannels: ["email", "dashboard"],
    description: "Alert when average response time exceeds 2 seconds",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert_2",
    name: "Conversation Volume Drop",
    type: "conversations",
    severity: "high",
    isActive: true,
    triggered: true,
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
    condition: "hourly_conversations < 10",
    threshold: "10 conversations/hour",
    currentValue: "8 conversations/hour",
    notificationChannels: ["email", "dashboard", "sms"],
    description: "Alert when conversation volume drops below expected levels",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert_3",
    name: "Sentiment Score Decline",
    type: "sentiment",
    severity: "medium",
    isActive: true,
    triggered: false,
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
    condition: "avg_sentiment < 0.6",
    threshold: "0.6 (60%)",
    currentValue: "0.72 (72%)",
    notificationChannels: ["dashboard"],
    description: "Monitor user sentiment and satisfaction trends",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert_4",
    name: "Critical Error Rate",
    type: "errors",
    severity: "critical",
    isActive: true,
    triggered: false,
    lastTriggered: null,
    condition: "error_rate > 5%",
    threshold: "5%",
    currentValue: "1.2%",
    notificationChannels: ["email", "dashboard", "sms", "slack"],
    description: "Immediate alert for critical system errors",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  }
];

// Mock historial de notificaciones
const mockNotificationHistory = [
  {
    id: "notif_1",
    alertId: "alert_2",
    alertName: "Conversation Volume Drop",
    triggered: new Date(Date.now() - 30 * 60 * 1000),
    severity: "high",
    message: "Conversation volume dropped to 8/hour (threshold: 10/hour)",
    acknowledged: true,
    acknowledgedBy: "admin@example.com",
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000),
    resolved: false
  },
  {
    id: "notif_2",
    alertId: "alert_1",
    alertName: "Response Time Spike",
    triggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: "medium",
    message: "Average response time reached 2.1 seconds",
    acknowledged: true,
    acknowledgedBy: "admin@example.com",
    acknowledgedAt: new Date(Date.now() - 90 * 60 * 1000),
    resolved: true,
    resolvedAt: new Date(Date.now() - 80 * 60 * 1000)
  }
];

/**
 * AlertsManager - Sistema avanzado de gestión de alertas automáticas
 */
export const AlertsManager: React.FC<AlertsManagerProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState(mockActiveAlerts);
  const [notifications, setNotifications] = useState(mockNotificationHistory);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const { toast } = useToast();

  // Nuevo alert form state
  const [newAlert, setNewAlert] = useState({
    name: "",
    type: "",
    severity: "medium",
    condition: "",
    threshold: "",
    description: "",
    notificationChannels: ["dashboard"]
  });

  // Filtros aplicados
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    if (filterType !== "all") {
      filtered = filtered.filter(alert => alert.type === filterType);
    }
    
    if (filterSeverity !== "all") {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }
    
    return filtered.sort((a, b) => {
      // Primero alertas activas triggereadas
      if (a.triggered && !b.triggered) return -1;
      if (!a.triggered && b.triggered) return 1;
      
      // Luego por severidad
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity as keyof typeof severityOrder] - 
             severityOrder[a.severity as keyof typeof severityOrder];
    });
  }, [alerts, filterType, filterSeverity]);

  // Analytics de alertas
  const alertAnalytics = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter(a => a.isActive).length;
    const triggered = alerts.filter(a => a.triggered).length;
    const criticalTriggered = alerts.filter(a => a.triggered && a.severity === 'critical').length;
    
    return { total, active, triggered, criticalTriggered };
  }, [alerts]);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => ({
          ...alert,
          // Simular cambios en valores actuales
          currentValue: alert.type === 'performance' 
            ? `${Math.floor(Math.random() * 3000 + 1000)}ms`
            : alert.type === 'conversations'
            ? `${Math.floor(Math.random() * 20 + 5)} conversations/hour`
            : alert.currentValue,
          // Simular algunos triggers aleatorios
          triggered: Math.random() > 0.95 ? !alert.triggered : alert.triggered
        }))
      );
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const handleCreateAlert = useCallback(async () => {
    setIsLoading(true);
    try {
      if (onAction) {
        await onAction('create-alert-rule', {
          ...newAlert,
          agentId: agent.agentId || agent.id
        });
      }

      const alertId = `alert_${Date.now()}`;
      const newAlertData = {
        id: alertId,
        ...newAlert,
        isActive: true,
        triggered: false,
        lastTriggered: null,
        currentValue: "N/A",
        createdAt: new Date()
      };

      setAlerts(prev => [...prev, newAlertData]);
      
      setNewAlert({
        name: "",
        type: "",
        severity: "medium",
        condition: "",
        threshold: "",
        description: "",
        notificationChannels: ["dashboard"]
      });
      
      setIsCreateModalOpen(false);
      
      toast({
        title: "Alert created",
        description: `New ${newAlert.type} alert "${newAlert.name}" has been created`,
      });
      
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error creating alert",
        description: "There was an error creating the alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newAlert, onAction, agent, toast]);

  const handleToggleAlert = useCallback(async (alertId: string) => {
    try {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, isActive: !alert.isActive }
            : alert
        )
      );
      
      toast({
        title: "Alert updated",
        description: "Alert status has been changed",
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  }, [toast]);

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, triggered: false }
            : alert
        )
      );
      
      toast({
        title: "Alert acknowledged",
        description: "Alert has been acknowledged and cleared",
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }, [toast]);

  return (
    <AdminContainer
      title="Automated Alerts System"
      subtitle={`Monitoring ${alertAnalytics.active} active alerts with ${alertAnalytics.triggered} currently triggered`}
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(alertTypes).map(([key, type]) => (
                <SelectItem key={key} value={key}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {Object.entries(severityLevels).map(([key, level]) => (
                <SelectItem key={key} value={key}>{level.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Alert
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{alertAnalytics.total}</div>
            <div className="text-xs text-blue-600">Alert Rules</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{alertAnalytics.active}</div>
            <div className="text-xs text-green-600">Monitoring</div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <BellRing className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Triggered</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{alertAnalytics.triggered}</div>
            <div className="text-xs text-yellow-600">Need Attention</div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{alertAnalytics.criticalTriggered}</div>
            <div className="text-xs text-red-600">Urgent</div>
          </div>
        </div>

        {/* Active Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const typeConfig = alertTypes[alert.type as keyof typeof alertTypes];
            const TypeIcon = typeConfig.icon;
            const severityConfig = severityLevels[alert.severity as keyof typeof severityLevels];
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 bg-white border rounded-xl transition-all duration-200",
                  alert.triggered 
                    ? "border-red-300 bg-red-50 shadow-lg" 
                    : "border-gray-200 hover:border-purple-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border",
                      `bg-${typeConfig.color}-50 text-${typeConfig.color}-600 border-${typeConfig.color}-200`
                    )}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {alert.name}
                        </h4>
                        <Badge className={cn("text-xs", severityConfig.color)}>
                          {severityConfig.label}
                        </Badge>
                        {alert.triggered && (
                          <Badge className="bg-red-100 text-red-800 animate-pulse">
                            TRIGGERED
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Condition:</span> {alert.condition}
                        </div>
                        <div>
                          <span className="font-medium">Threshold:</span> {alert.threshold}
                        </div>
                        <div className={cn(
                          "font-medium",
                          alert.triggered ? "text-red-600" : "text-green-600"
                        )}>
                          <span>Current:</span> {alert.currentValue}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Last triggered: {alert.lastTriggered 
                            ? alert.lastTriggered.toLocaleString() 
                            : 'Never'}
                        </span>
                        <span>
                          Channels: {alert.notificationChannels.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {alert.triggered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAlert(alert.id)}
                      className={cn(
                        alert.isActive 
                          ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          : "text-green-600 border-green-200 hover:bg-green-50"
                      )}
                    >
                      {alert.isActive ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Notifications */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {mockNotificationHistory.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    notification.resolved ? "bg-green-400" : 
                    notification.acknowledged ? "bg-yellow-400" : "bg-red-400"
                  )} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{notification.alertName}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {notification.triggered.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Alert Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Alert Rule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Alert Name</label>
                <Input
                  placeholder="Enter alert name"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={newAlert.type} onValueChange={(value) => setNewAlert({...newAlert, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(alertTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
                <Select value={newAlert.severity} onValueChange={(value) => setNewAlert({...newAlert, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(severityLevels).map(([key, level]) => (
                      <SelectItem key={key} value={key}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Threshold</label>
                <Input
                  placeholder="e.g., 2000ms, 10%, 50 messages"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({...newAlert, threshold: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
              <Input
                placeholder="e.g., avg_response_time > 2000ms"
                value={newAlert.condition}
                onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what this alert monitors..."
                value={newAlert.description}
                onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Notification Channels</label>
              <div className="grid grid-cols-2 gap-2">
                {['dashboard', 'email', 'sms', 'slack'].map((channel) => (
                  <label key={channel} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAlert.notificationChannels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAlert({
                            ...newAlert,
                            notificationChannels: [...newAlert.notificationChannels, channel]
                          });
                        } else {
                          setNewAlert({
                            ...newAlert,
                            notificationChannels: newAlert.notificationChannels.filter(c => c !== channel)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlert}
                disabled={!newAlert.name || !newAlert.type || !newAlert.condition || isLoading}
              >
                {isLoading ? "Creating..." : "Create Alert"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
};