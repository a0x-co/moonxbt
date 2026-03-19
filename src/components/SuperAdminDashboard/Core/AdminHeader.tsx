"use client";

import { useState } from "react";
import Image from "next/image";
import { Crown, Settings, Activity, Users } from "lucide-react";

interface AdminHeaderProps {
  agent: any;
  refetchAgent?: () => void;
}

/**
 * Header específico para SuperAdmin Dashboard
 * Basado en el patrón del Header existente pero con elementos admin
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  agent, 
  refetchAgent 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="rounded-[20px] bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Agent Avatar - mismo patrón que Header existente */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            {agent?.image_url ? (
              <Image
                src={agent.image_url}
                alt={agent.name || "Agent"}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <Crown className="w-8 h-8 text-purple-600" />
            )}
          </div>
          
          {/* Admin Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {agent?.name || "Agent"}
            </h1>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              SuperAdmin
            </div>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Agent ID: <span className="font-mono">{agent?.agentId}</span></p>
            <p>Version: <span className="font-medium">{agent?.version || "1.0.0"}</span></p>
            {agent?.creatorAddress && (
              <p>
                Creator: 
                <span className="font-mono ml-1">
                  {Array.isArray(agent.creatorAddress) 
                    ? agent.creatorAddress[0]?.slice(0, 6) + "..." + agent.creatorAddress[0]?.slice(-4)
                    : agent.creatorAddress?.slice(0, 6) + "..." + agent.creatorAddress?.slice(-4)
                  }
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats - similar al Header existente */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xs text-gray-500">Status</div>
            <div className="text-sm font-medium text-green-600">Active</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-xs text-gray-500">Platform</div>
            <div className="text-sm font-medium">
              {[
                agent?.twitterClient?.username && "Twitter",
                agent?.farcasterClient?.status === "approved" && "Farcaster", 
                agent?.telegramClient && "Telegram"
              ].filter(Boolean).length || 0}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-2">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-xs text-gray-500">Actions</div>
            <div className="text-sm font-medium">9</div>
          </div>
        </div>
      </div>

      {/* Admin Actions Bar */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Administrative mode active</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            {refetchAgent && (
              <button
                onClick={refetchAgent}
                disabled={isLoading}
                className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? "..." : "↻"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};