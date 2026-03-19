"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  Users,
  Eye,
  MessageCircle,
  Send,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Filter,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Pin,
  PinOff,
  Reply,
  Heart,
  ThumbsUp,
  Share,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Badge } from "@/components/shadcn/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/shadcn/avatar";
import { Switch } from "@/components/shadcn/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface ChatMessage {
  id: string;
  adminId: string;
  adminName: string;
  message: string;
  timestamp: Date;
  type: "message" | "insight";
  isPinned: boolean;
  reactions: Reaction[];
  mentions: string[];
  references: {
    section: string;
    metric?: string;
    action?: string;
  } | null;
}

interface RealtimeCollaborationProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Mock data de admins activos
const mockActiveAdmins = [
  {
    id: "admin_1",
    name: "Alex Rivera",
    email: "alex@a0x.co",
    role: "Super Admin",
    avatar: "",
    status: "online",
    currentAction: "Reviewing alerts configuration",
    joinedAt: new Date(Date.now() - 45 * 60 * 1000),
    permissions: ["read", "write", "deploy", "manage_users"],
    isViewing: "performance-dashboard",
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
    actionsToday: 23,
  },
  {
    id: "admin_2",
    name: "Sarah Chen",
    email: "sarah@a0x.co",
    role: "Agent Admin",
    avatar: "",
    status: "online",
    currentAction: "Analyzing conversation patterns",
    joinedAt: new Date(Date.now() - 120 * 60 * 1000),
    permissions: ["read", "write"],
    isViewing: "conversations-viewer",
    lastActivity: new Date(Date.now() - 30 * 1000),
    actionsToday: 18,
  },
  {
    id: "admin_3",
    name: "Marcus Johnson",
    email: "marcus@a0x.co",
    role: "Analytics Admin",
    avatar: "",
    status: "away",
    currentAction: "Generating quarterly reports",
    joinedAt: new Date(Date.now() - 30 * 60 * 1000),
    permissions: ["read", "analytics"],
    isViewing: "trend-analyzer",
    lastActivity: new Date(Date.now() - 10 * 60 * 1000),
    actionsToday: 7,
  },
  {
    id: "admin_4",
    name: "Emily Davis",
    email: "emily@a0x.co",
    role: "Agent Admin",
    avatar: "",
    status: "offline",
    currentAction: "No current activity",
    joinedAt: new Date(Date.now() - 180 * 60 * 1000),
    permissions: ["read", "write"],
    isViewing: "No active view",
    lastActivity: new Date(Date.now() - 180 * 60 * 1000),
    actionsToday: 0,
  },
];

// Mock chat messages
const mockChatMessages = [
  {
    id: "msg_1",
    adminId: "admin_2",
    adminName: "Sarah Chen",
    message:
      "I noticed the conversation volume dropped significantly in the last hour. Anyone else seeing this?",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: "message" as const,
    isPinned: false,
    reactions: [
      { emoji: "👍", count: 2, userIds: ["admin_1", "admin_3"] },
      { emoji: "👀", count: 1, userIds: ["admin_1"] },
    ],
    mentions: [] as string[],
    references: {
      section: "conversations-viewer",
      metric: "hourly_volume",
    },
  },
  {
    id: "msg_2",
    adminId: "admin_1",
    adminName: "Alex Rivera",
    message:
      "Yes, I see it too. Created an alert rule to monitor this going forward. The agent seems to be having some response delays.",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    type: "message" as const,
    isPinned: false,
    reactions: [{ emoji: "✅", count: 1, userIds: ["admin_2"] }],
    mentions: ["admin_2"] as string[],
    references: {
      section: "alerts-manager",
      action: "create_alert_rule",
    },
  },
  {
    id: "msg_3",
    adminId: "admin_3",
    adminName: "Marcus Johnson",
    message:
      "I've been running some analytics. The pattern shows this usually correlates with Twitter API rate limits. Should resolve in about 30 minutes.",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    type: "insight" as const,
    isPinned: true,
    reactions: [
      { emoji: "🧠", count: 2, userIds: ["admin_1", "admin_2"] },
      { emoji: "📊", count: 1, userIds: ["admin_1"] },
    ],
    mentions: [] as string[],
    references: {
      section: "trend-analyzer",
      metric: "twitter_api_latency",
    },
  },
  {
    id: "msg_4",
    adminId: "admin_1",
    adminName: "Alex Rivera",
    message:
      "Good catch @Marcus! I'll pin this insight for the team. Let's monitor the recovery.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: "message" as const,
    isPinned: false,
    reactions: [],
    mentions: ["admin_3"] as string[],
    references: null,
  },
];

// Mock activity feed
const mockActivityFeed = [
  {
    id: "activity_1",
    adminId: "admin_1",
    adminName: "Alex Rivera",
    action: "Created alert rule",
    details: "Response Time Monitoring",
    section: "alerts-manager",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    impact: "high",
  },
  {
    id: "activity_2",
    adminId: "admin_2",
    adminName: "Sarah Chen",
    action: "Exported conversation data",
    details: "1,247 conversations (CSV)",
    section: "conversations-viewer",
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    impact: "medium",
  },
  {
    id: "activity_3",
    adminId: "admin_3",
    adminName: "Marcus Johnson",
    action: "Generated analytics report",
    details: "Predictive Analysis - 7-day forecast",
    section: "trend-analyzer",
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    impact: "medium",
  },
  {
    id: "activity_4",
    adminId: "admin_1",
    adminName: "Alex Rivera",
    action: "Updated agent configuration",
    details: "Personality parameters adjusted",
    section: "agent-settings",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    impact: "high",
  },
];

const statusConfig = {
  online: {
    color: "bg-green-400",
    label: "Online",
    textColor: "text-green-600",
  },
  away: { color: "bg-yellow-400", label: "Away", textColor: "text-yellow-600" },
  offline: {
    color: "bg-gray-400",
    label: "Offline",
    textColor: "text-gray-600",
  },
};

const roleConfig = {
  "Super Admin": { color: "bg-purple-100 text-purple-800", icon: Crown },
  "Agent Admin": { color: "bg-blue-100 text-blue-800", icon: Shield },
  "Analytics Admin": { color: "bg-green-100 text-green-800", icon: Activity },
};

/**
 * RealtimeCollaboration - Sistema de colaboración en tiempo real entre administradores
 */
export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdmins, setActiveAdmins] = useState(mockActiveAdmins);
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(mockChatMessages);
  const [activityFeed, setActivityFeed] = useState(mockActivityFeed);
  const [newMessage, setNewMessage] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [chatFilter, setChatFilter] = useState("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();

  // Colaboración stats
  const collaborationStats = useMemo(() => {
    const onlineAdmins = activeAdmins.filter(
      (a) => a.status === "online"
    ).length;
    const totalActions = activeAdmins.reduce(
      (sum, admin) => sum + admin.actionsToday,
      0
    );
    const avgResponseTime = "2.3 min"; // Simulado
    const activeChats = chatMessages.filter(
      (m) => new Date().getTime() - m.timestamp.getTime() < 60 * 60 * 1000
    ).length;

    return {
      onlineAdmins,
      totalActions,
      avgResponseTime,
      activeChats,
    };
  }, [activeAdmins, chatMessages]);

  // Mensajes filtrados
  const filteredMessages = useMemo(() => {
    let filtered = chatMessages;

    if (chatFilter === "pinned") {
      filtered = filtered.filter((msg) => msg.isPinned);
    } else if (chatFilter === "insights") {
      filtered = filtered.filter((msg) => msg.type === "insight");
    } else if (chatFilter === "mentions") {
      filtered = filtered.filter(
        (msg) => msg.mentions && msg.mentions.length > 0
      );
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [chatMessages, chatFilter]);

  // Simular updates en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular cambios de status
      setActiveAdmins((prev) =>
        prev.map((admin) => ({
          ...admin,
          currentAction:
            Math.random() > 0.8
              ? `Working on ${
                  ["alerts", "conversations", "analytics", "reports"][
                    Math.floor(Math.random() * 4)
                  ]
                }`
              : admin.currentAction,
          lastActivity:
            admin.status === "online" && Math.random() > 0.7
              ? new Date()
              : admin.lastActivity,
        }))
      );

      // Simular nuevas actividades ocasionalmente
      if (Math.random() > 0.95) {
        const newActivity = {
          id: `activity_${Date.now()}`,
          adminId: "admin_1",
          adminName: "Alex Rivera",
          action: "System update",
          details: "Real-time collaboration sync",
          section: "collaboration",
          timestamp: new Date(),
          impact: "low" as const,
        };

        setActivityFeed((prev) => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: `msg_${Date.now()}`,
      adminId: "current_admin",
      adminName: "Current Admin",
      message: newMessage,
      timestamp: new Date(),
      type: "message" as const,
      isPinned: false,
      reactions: [],
      mentions: [],
      references: null,
    };

    setChatMessages((prev) => [messageData, ...prev]);
    setNewMessage("");

    if (onAction) {
      await onAction("send-collaboration-message", {
        agentId: agent.agentId || agent.id,
        message: newMessage,
        timestamp: new Date().toISOString(),
      });
    }

    toast({
      title: "Message sent",
      description: "Your message has been shared with the team",
    });
  }, [newMessage, onAction, agent, toast]);

  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      setChatMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find(
              (r) => r.emoji === emoji
            );
            if (existingReaction) {
              const hasUserReacted =
                existingReaction.userIds.includes("current_admin");
              if (hasUserReacted) {
                // Remove reaction
                existingReaction.count -= 1;
                existingReaction.userIds = existingReaction.userIds.filter(
                  (id) => id !== "current_admin"
                );
                if (existingReaction.count === 0) {
                  msg.reactions = msg.reactions.filter(
                    (r) => r.emoji !== emoji
                  );
                }
              } else {
                // Add reaction
                existingReaction.count += 1;
                existingReaction.userIds.push("current_admin");
              }
            } else {
              // New reaction
              msg.reactions.push({
                emoji,
                count: 1,
                userIds: ["current_admin"],
              });
            }
          }
          return msg;
        })
      );
    },
    []
  );

  const handlePinMessage = useCallback(
    async (messageId: string) => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
        )
      );

      toast({
        title: "Message pinned",
        description: "Message has been pinned for the team",
      });
    },
    [toast]
  );

  return (
    <AdminContainer
      title="Real-time Admin Collaboration"
      subtitle={`${collaborationStats.onlineAdmins} admins online • ${collaborationStats.totalActions} actions today • ${collaborationStats.activeChats} active discussions`}
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Bell
              className={cn(
                "w-4 h-4",
                notificationsEnabled ? "text-blue-600" : "text-gray-400"
              )}
            />
            <span className="hidden sm:inline">Notifications</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            <Volume2
              className={cn(
                "w-4 h-4",
                soundEnabled ? "text-blue-600" : "text-gray-400"
              )}
            />
            <span className="hidden sm:inline">Sound</span>
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            Invite Admin
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel central - Team Chat */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white rounded-xl border border-gray-200 h-[800px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Chat</h3>

              <div className="flex items-center gap-2">
                <Select value={chatFilter} onValueChange={setChatFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="pinned">Pinned</SelectItem>
                    <SelectItem value="insights">Insights</SelectItem>
                    <SelectItem value="mentions">Mentions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {filteredMessages.map((message) => (
                <div key={message.id} className="group">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.adminName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {message.adminName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.type === "insight" && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Insight
                          </Badge>
                        )}
                        {message.isPinned && (
                          <Pin className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          message.type === "insight"
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                        )}
                      >
                        <p className="text-gray-800 mb-2">{message.message}</p>

                        {message.references && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span className="capitalize">
                              {message.references.section.replace("-", " ")}
                            </span>
                            {message.references.metric && (
                              <>
                                <span>•</span>
                                <span>{message.references.metric}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {message.reactions.map((reaction) => (
                              <button
                                key={reaction.emoji}
                                onClick={() =>
                                  handleReaction(message.id, reaction.emoji)
                                }
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleReaction(message.id, "👍")}
                          >
                            <ThumbsUp className="w-3 h-3 mr-2" />
                            React
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePinMessage(message.id)}
                          >
                            {message.isPinned ? (
                              <>
                                <PinOff className="w-3 h-3 mr-2" />
                                Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="w-3 h-3 mr-2" />
                                Pin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="w-3 h-3 mr-2" />
                            Reply
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message to the team..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <div className="flex items-center gap-2">
                  <span>Quick reactions:</span>
                  {["👍", "👀", "🧠", "✅", "❤️"].map((emoji) => (
                    <button
                      key={emoji}
                      className="hover:scale-110 transition-transform"
                      onClick={() => setNewMessage((prev) => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Profile</DialogTitle>
          </DialogHeader>

          {selectedAdmin && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedAdmin.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedAdmin.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                      statusConfig[
                        selectedAdmin.status as keyof typeof statusConfig
                      ].color
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAdmin.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedAdmin.email}</p>
                  <Badge
                    className={cn(
                      "text-xs mt-1",
                      roleConfig[selectedAdmin.role as keyof typeof roleConfig]
                        .color
                    )}
                  >
                    {selectedAdmin.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={cn(
                      "font-medium capitalize",
                      statusConfig[
                        selectedAdmin.status as keyof typeof statusConfig
                      ].textColor
                    )}
                  >
                    {selectedAdmin.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Actions Today</p>
                  <p className="font-medium">{selectedAdmin.actionsToday}</p>
                </div>
                <div>
                  <p className="text-gray-600">Joined Session</p>
                  <p className="font-medium">
                    {selectedAdmin.joinedAt?.toLocaleTimeString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Activity</p>
                  <p className="font-medium">
                    {selectedAdmin.lastActivity.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Current Activity</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAdmin.currentAction || "No current activity"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAdmin.permissions.map((permission: string) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className="text-xs"
                    >
                      {permission.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
};
