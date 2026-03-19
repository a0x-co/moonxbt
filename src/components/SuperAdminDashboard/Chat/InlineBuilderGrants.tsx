"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, DollarSign, Shield, ExternalLink, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuilderProfile {
  address: string;
  name?: string;
  talentScore?: number;
  githubUsername?: string;
  projectDescription?: string;
  requestedAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'funded';
}

interface GrantData {
  builderAddress: string;
  amount: number;
  reason: string;
  category: 'development' | 'research' | 'community' | 'infrastructure' | 'other';
  milestone?: string;
}

interface InlineBuilderGrantsProps {
  data?: {
    pendingApplications?: BuilderProfile[];
    grantPool?: {
      totalAvailable: number;
      distributed: number;
      remainingUSDC: number;
    };
    recentGrants?: Array<{
      recipient: string;
      amount: number;
      date: string;
      reason: string;
    }>;
  };
  onGrant?: (grant: GrantData) => Promise<void>;
  isLoading?: boolean;
  isDark?: boolean;
}

const GRANT_CATEGORIES = [
  { value: 'development', label: 'Development', icon: '💻' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'community', label: 'Community', icon: '👥' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '⚙️' },
] as const;

const SUGGESTED_AMOUNTS = [50, 100, 250, 500, 1000];

const MOCK_DATA = {
  pendingApplications: [
    {
      address: '0x1234...5678',
      name: 'Alice Builder',
      talentScore: 85,
      githubUsername: 'alicebuilder',
      projectDescription: 'Building a DeFi dashboard for A0X agents',
      requestedAmount: 500,
      status: 'pending' as const,
    },
    {
      address: '0x9876...4321',
      name: 'Bob Developer',
      talentScore: 72,
      githubUsername: 'bobdev',
      projectDescription: 'Open source Twitter sentiment analysis tool',
      requestedAmount: 250,
      status: 'pending' as const,
    },
    {
      address: '0xabcd...efgh',
      name: 'Carol Researcher',
      talentScore: 91,
      githubUsername: 'carolresearch',
      projectDescription: 'AI personality optimization research',
      requestedAmount: 750,
      status: 'pending' as const,
    },
  ],
  grantPool: {
    totalAvailable: 50000,
    distributed: 12500,
    remainingUSDC: 37500,
  },
  recentGrants: [
    {
      recipient: 'David Builder',
      amount: 500,
      date: '2024-01-15',
      reason: 'Agent memory optimization system',
    },
    {
      recipient: 'Eva Researcher',
      amount: 300,
      date: '2024-01-12',
      reason: 'Community onboarding improvements',
    },
  ],
};

export function InlineBuilderGrants({
  data = MOCK_DATA,
  onGrant,
  isLoading = false,
  isDark = false,
}: InlineBuilderGrantsProps) {
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderProfile | null>(null);
  const [grantData, setGrantData] = useState<GrantData>({
    builderAddress: '',
    amount: 250,
    reason: '',
    category: 'development',
    milestone: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBuilderSelect = (builder: BuilderProfile) => {
    setSelectedBuilder(builder);
    setGrantData(prev => ({
      ...prev,
      builderAddress: builder.address,
      amount: builder.requestedAmount || 250,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onGrant) return;
    
    if (!grantData.builderAddress || !grantData.reason.trim()) {
      setError('Please select a builder and provide a reason');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onGrant(grantData);
      setSuccess(true);
      setSelectedBuilder(null);
      setGrantData({
        builderAddress: '',
        amount: 250,
        reason: '',
        category: 'development',
        milestone: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant USDC');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
            Builder Grants & USDC Distribution
          </h3>
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            Evaluate and distribute USDC microgrants to qualified builders
          </p>
        </div>
      </div>

      {/* Grant Pool Status */}
      {data.grantPool && (
        <div className={cn(
          "p-4 rounded-lg mb-6",
          isDark ? "bg-gray-700" : "bg-gray-50"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
              Grant Pool Status
            </h4>
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold">${data.grantPool.remainingUSDC.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div>
              <span className={cn("text-gray-500", isDark && "text-gray-400")}>Total: </span>
              <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                ${data.grantPool.totalAvailable.toLocaleString()}
              </span>
            </div>
            <div>
              <span className={cn("text-gray-500", isDark && "text-gray-400")}>Distributed: </span>
              <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                ${data.grantPool.distributed.toLocaleString()}
              </span>
            </div>
            <div>
              <span className={cn("text-gray-500", isDark && "text-gray-400")}>Remaining: </span>
              <span className="font-medium text-green-600">
                ${data.grantPool.remainingUSDC.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className={cn("w-full bg-gray-200 rounded-full h-2", isDark && "bg-gray-600")}>
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(data.grantPool.distributed / data.grantPool.totalAvailable) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

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
          <span className="text-sm">Grant approved and USDC transferred successfully!</span>
        </motion.div>
      )}

      {/* Pending Applications */}
      {data.pendingApplications && data.pendingApplications.length > 0 && (
        <div className="mb-6">
          <h4 className={cn("font-medium mb-3", isDark ? "text-gray-200" : "text-gray-700")}>
            Pending Applications ({data.pendingApplications.length})
          </h4>
          
          <div className="space-y-3">
            {data.pendingApplications.map((builder, index) => (
              <motion.button
                key={builder.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleBuilderSelect(builder)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  selectedBuilder?.address === builder.address
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                    : isDark 
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600" 
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {builder.name || 'Anonymous Builder'}
                      </h5>
                      {builder.talentScore && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">
                            {builder.talentScore}/100
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>
                      {builder.projectDescription}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className={cn("font-mono", isDark ? "text-gray-400" : "text-gray-500")}>
                        {builder.address}
                      </span>
                      {builder.githubUsername && (
                        <a 
                          href={`https://github.com/${builder.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {builder.githubUsername}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      ${builder.requestedAmount}
                    </div>
                    <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                      Requested
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Grant Form */}
      {selectedBuilder && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className={cn(
            "p-4 rounded-lg border space-y-4",
            isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
          )}
        >
          <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
            Grant USDC to {selectedBuilder.name || 'Builder'}
          </h4>

          {/* Amount */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
              Amount (USDC)
            </label>
            <div className="flex gap-2 mb-2">
              {SUGGESTED_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setGrantData(prev => ({ ...prev, amount }))}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    grantData.amount === amount
                      ? "bg-yellow-500 text-white"
                      : isDark 
                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={grantData.amount}
              onChange={(e) => setGrantData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className={cn(
                "w-full p-2 rounded-lg border transition-colors",
                isDark 
                  ? "bg-gray-600 border-gray-500 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              )}
              min="1"
              max={data.grantPool?.remainingUSDC || 1000}
            />
          </div>

          {/* Category */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
              Category
            </label>
            <select
              value={grantData.category}
              onChange={(e) => setGrantData(prev => ({ ...prev, category: e.target.value as GrantData['category'] }))}
              className={cn(
                "w-full p-2 rounded-lg border transition-colors",
                isDark 
                  ? "bg-gray-600 border-gray-500 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              )}
            >
              {GRANT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
              Reason for Grant *
            </label>
            <textarea
              value={grantData.reason}
              onChange={(e) => setGrantData(prev => ({ ...prev, reason: e.target.value }))}
              className={cn(
                "w-full p-2 rounded-lg border resize-none transition-colors",
                isDark 
                  ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              )}
              rows={2}
              placeholder="Explain why this builder deserves the grant..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
                "hover:from-yellow-600 hover:to-orange-700 hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              {isSubmitting ? "Processing..." : `Grant $${grantData.amount} USDC`}
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedBuilder(null)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                isDark 
                  ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Recent Grants */}
      {data.recentGrants && data.recentGrants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className={cn("font-medium mb-3", isDark ? "text-gray-200" : "text-gray-700")}>
            Recent Grants
          </h4>
          <div className="space-y-2">
            {data.recentGrants.map((grant, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isDark ? "bg-gray-700" : "bg-gray-50"
                )}
              >
                <div>
                  <div className={cn("font-medium text-sm", isDark ? "text-white" : "text-gray-900")}>
                    {grant.recipient}
                  </div>
                  <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    {grant.reason}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${grant.amount}
                  </div>
                  <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                    {new Date(grant.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-yellow-200 border-t-yellow-600 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}