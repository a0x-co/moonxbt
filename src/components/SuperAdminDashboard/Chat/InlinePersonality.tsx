"use client";

import React, { useState } from "react";
import {
  Brain,
  User,
  BookOpen,
  MessageCircle,
  Palette,
  Lightbulb,
  Hash,
  FileText,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  History,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Textarea } from "@/components/shadcn/textarea";
import { Input } from "@/components/shadcn/input";
import { cn } from "@/lib/utils";

interface InlinePersonalityProps {
  data?: {
    detectedField?: string;
    actionType?: string;
    currentValues?: any;
    fullPersonality?: any;
    fieldAnalysis?: any;
    suggestions?: any;
    lastUpdated?: string;
    backupAvailable?: boolean;
    permissionsLevel?: string;
    renderMode?: "full" | "partial" | "update_result";
    editableFields?: string[];
    appliedInstructions?: any[];
    changes?: any[];
    changeSummary?: string;
    backupId?: string;
  };
  compact?: boolean;
  theme?: string;
  onPersonalityUpdate?: (field: string, action: string, content: string) => void;
}

/**
 * InlinePersonality - SuperAdmin personality management component
 * Supports viewing and editing personality fields with intelligent field detection
 */
export const InlinePersonality: React.FC<InlinePersonalityProps> = ({
  data,
  compact = true,
  theme = "light",
  onPersonalityUpdate,
}) => {
  const isDark = theme === "dark";
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Extract personality data
  const personalityData = {
    detectedField: data?.detectedField || "all",
    actionType: data?.actionType || "show",
    renderMode: data?.renderMode || "full",
    currentValues: data?.currentValues || data?.fullPersonality || {},
    analysis: data?.fieldAnalysis || {},
    suggestions: data?.suggestions || {},
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
    backupAvailable: data?.backupAvailable || false,
    editableFields: data?.editableFields || [],
    changes: data?.changes || [],
    changeSummary: data?.changeSummary,
    appliedInstructions: data?.appliedInstructions || [],
  };

  // Field configurations with icons and colors
  const fieldConfigs = {
    bio: {
      label: "Biography",
      icon: User,
      color: "blue",
      description: "Agent's background and purpose",
    },
    lore: {
      label: "Lore & Story",
      icon: BookOpen,
      color: "purple",
      description: "History and narrative background",
    },
    adjectives: {
      label: "Personality Traits",
      icon: Hash,
      color: "green",
      description: "Descriptive adjectives and characteristics",
    },
    style: {
      label: "Communication Style",
      icon: MessageCircle,
      color: "amber",
      description: "How the agent communicates",
    },
    knowledge: {
      label: "Knowledge Base",
      icon: Lightbulb,
      color: "orange",
      description: "Areas of expertise and knowledge",
    },
    topics: {
      label: "Expertise Topics",
      icon: FileText,
      color: "cyan",
      description: "Main topics and subjects",
    },
    system: {
      label: "System Prompt",
      icon: Brain,
      color: "indigo",
      description: "Core system instructions",
    },
  };

  const colorConfig = {
    blue: isDark
      ? "bg-blue-900/20 text-blue-400 border-blue-700/50"
      : "bg-blue-50 text-blue-600 border-blue-100",
    purple: isDark
      ? "bg-purple-900/20 text-purple-400 border-purple-700/50"
      : "bg-purple-50 text-purple-600 border-purple-100",
    green: isDark
      ? "bg-green-900/20 text-green-400 border-green-700/50"
      : "bg-green-50 text-green-600 border-green-100",
    amber: isDark
      ? "bg-amber-900/20 text-amber-400 border-amber-700/50"
      : "bg-amber-50 text-amber-600 border-amber-100",
    orange: isDark
      ? "bg-orange-900/20 text-orange-400 border-orange-700/50"
      : "bg-orange-50 text-orange-600 border-orange-100",
    cyan: isDark
      ? "bg-cyan-900/20 text-cyan-400 border-cyan-700/50"
      : "bg-cyan-50 text-cyan-600 border-cyan-100",
    indigo: isDark
      ? "bg-indigo-900/20 text-indigo-400 border-indigo-700/50"
      : "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    if (Array.isArray(currentValue)) {
      setEditValue(currentValue.join(", "));
    } else if (typeof currentValue === "object") {
      setEditValue(JSON.stringify(currentValue, null, 2));
    } else {
      setEditValue(currentValue || "");
    }
  };

  const handleEditSave = () => {
    if (editingField && onPersonalityUpdate) {
      onPersonalityUpdate(editingField, "update", editValue);
    }
    setEditingField(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const renderFieldValue = (field: string, value: any) => {
    if (!value) return <span className="text-gray-400 italic">Not set</span>;

    if (Array.isArray(value)) {
      if (field === "adjectives") {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  "text-xs",
                  colorConfig[fieldConfigs[field as keyof typeof fieldConfigs]?.color as keyof typeof colorConfig]
                )}
              >
                {item}
              </Badge>
            ))}
          </div>
        );
      }
      return (
        <ul className="space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <span className="font-medium text-sm capitalize">{key}:</span>
              <div className="ml-4">{renderFieldValue(key, val)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-sm">{value}</span>;
  };

  const renderPersonalityField = (field: string, value: any) => {
    const config = fieldConfigs[field as keyof typeof fieldConfigs];
    if (!config) return null;

    const IconComponent = config.icon;
    const isEditing = editingField === field;
    const canEdit = personalityData.editableFields.includes(field);

    return (
      <div
        key={field}
        className={cn(
          "border rounded-lg p-4 space-y-3",
          isDark
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        )}
      >
        {/* Field header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                colorConfig[config.color as keyof typeof colorConfig]
              )}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                {config.label}
              </h4>
              <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                {config.description}
              </p>
            </div>
          </div>
          
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStart(field, value)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Field content */}
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              {Array.isArray(value) || typeof value === "object" ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${config.label.toLowerCase()} (comma-separated for lists)`}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${config.label.toLowerCase()}`}
                />
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditCancel}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn("", isDark ? "text-gray-300" : "text-gray-700")}>
              {renderFieldValue(field, value)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show update results if we have changes
  if (personalityData.renderMode === "update_result" && personalityData.changes.length > 0) {
    return (
      <div
        className={cn(
          "rounded-xl border p-6 space-y-6",
          isDark
            ? "bg-gray-900/50 border-gray-800"
            : "bg-white border-gray-200"
        )}
      >
        {/* Update success header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Personality Updated Successfully
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              {personalityData.changeSummary}
            </p>
          </div>
        </div>

        {/* Changes summary */}
        <div className="space-y-3">
          <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
            Changes Applied:
          </h4>
          {personalityData.changes.map((change, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-lg p-3",
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{change.field}</Badge>
                <Badge variant="secondary">{change.action}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Before:</span>
                  <div className="mt-1 text-gray-500">
                    {Array.isArray(change.before) ? change.before.join(", ") : change.before || "Empty"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">After:</span>
                  <div className="mt-1">
                    {Array.isArray(change.after) ? change.after.join(", ") : change.after}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Backup info */}
        {personalityData.backupAvailable && (
          <div className={cn(
            "border rounded-lg p-3 flex items-center gap-2",
            isDark ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
          )}>
            <History className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              Backup created and available for rollback if needed
            </span>
          </div>
        )}
      </div>
    );
  }

  // Determine which fields to show
  const fieldsToShow = personalityData.detectedField === "all" 
    ? Object.keys(personalityData.currentValues).filter(field => 
        personalityData.currentValues[field] && 
        fieldConfigs[field as keyof typeof fieldConfigs]
      )
    : [personalityData.detectedField].filter(field => 
        personalityData.currentValues[field] &&
        fieldConfigs[field as keyof typeof fieldConfigs]
      );

  return (
    <div
      className={cn(
        "rounded-xl border space-y-6",
        compact ? "p-4" : "p-6",
        isDark
          ? "bg-gray-900/50 border-gray-800"
          : "bg-white border-gray-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Agent Personality
              {personalityData.detectedField !== "all" && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({fieldConfigs[personalityData.detectedField as keyof typeof fieldConfigs]?.label})
                </span>
              )}
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              {personalityData.detectedField === "all" 
                ? "Complete personality configuration" 
                : "Focused view and editing"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {personalityData.actionType}
          </Badge>
          {personalityData.backupAvailable && (
            <Badge variant="secondary" className="text-xs">
              <History className="w-3 h-3 mr-1" />
              Backup
            </Badge>
          )}
        </div>
      </div>

      {/* Personality fields */}
      <div className="space-y-4">
        {fieldsToShow.length > 0 ? (
          fieldsToShow.map(field => 
            renderPersonalityField(field, personalityData.currentValues[field])
          )
        ) : (
          <div className={cn(
            "border rounded-lg p-8 text-center",
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              No personality data found for the specified field
            </p>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {personalityData.suggestions?.improvements?.length > 0 && (
        <div className={cn(
          "border rounded-lg p-4",
          isDark ? "bg-amber-900/20 border-amber-700" : "bg-amber-50 border-amber-200"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-sm">Suggestions</span>
          </div>
          <ul className="space-y-1">
            {personalityData.suggestions.improvements.map((suggestion: string, index: number) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>Last updated: {new Date(personalityData.lastUpdated).toLocaleString()}</span>
        <span>SuperAdmin • Personality Management</span>
      </div>
    </div>
  );
};