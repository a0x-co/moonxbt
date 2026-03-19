"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Save, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalityData {
  bio?: string;
  lore?: string;
  style?: string;
  adjectives?: string[];
  systemPrompt?: string;
}

interface InlinePersonalityFormProps {
  data?: PersonalityData;
  onUpdate?: (data: PersonalityData) => Promise<void>;
  isLoading?: boolean;
  isDark?: boolean;
}

export function InlinePersonalityForm({
  data,
  onUpdate,
  isLoading = false,
  isDark = false,
}: InlinePersonalityFormProps) {
  const [formData, setFormData] = useState<PersonalityData>(data || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onUpdate(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update personality');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjectivesChange = (value: string) => {
    const adjectives = value.split(',').map(adj => adj.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, adjectives }));
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
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
            Update Agent Personality
          </h3>
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            Modify personality configuration and behavioral traits
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
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-sm">Personality updated successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bio Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
            Bio
          </label>
          <textarea
            value={formData.bio || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors",
              isDark 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500"
            )}
            rows={3}
            placeholder="Agent bio and background..."
          />
        </div>

        {/* Lore Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
            Lore
          </label>
          <textarea
            value={formData.lore || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, lore: e.target.value }))}
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors",
              isDark 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500"
            )}
            rows={2}
            placeholder="Agent lore and story..."
          />
        </div>

        {/* Style Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
            Communication Style
          </label>
          <input
            type="text"
            value={formData.style || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            className={cn(
              "w-full p-3 rounded-lg border transition-colors",
              isDark 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500"
            )}
            placeholder="Communication style and tone..."
          />
        </div>

        {/* Adjectives Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
            Adjectives
          </label>
          <input
            type="text"
            value={formData.adjectives?.join(', ') || ""}
            onChange={(e) => handleAdjectivesChange(e.target.value)}
            className={cn(
              "w-full p-3 rounded-lg border transition-colors",
              isDark 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500"
            )}
            placeholder="creative, helpful, intelligent (comma-separated)"
          />
          <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
            Separate multiple adjectives with commas
          </p>
        </div>

        {/* System Prompt Field */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-200" : "text-gray-700")}>
            System Prompt Override
            <span className={cn("text-xs font-normal ml-2", isDark ? "text-gray-400" : "text-gray-500")}>
              (Optional - Advanced)
            </span>
          </label>
          <textarea
            value={formData.systemPrompt || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
            className={cn(
              "w-full p-3 rounded-lg border resize-none transition-colors font-mono text-sm",
              isDark 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500"
            )}
            rows={3}
            placeholder="Custom system prompt for advanced personality control..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
              "hover:from-violet-600 hover:to-purple-700 hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Updating..." : "Update Personality"}
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(data || {})}
            disabled={isSubmitting}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              isDark 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}