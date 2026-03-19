"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  MessageSquare,
  MessageCircle,
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Zap,
  Crown,
  Brain,
  Shield,
  Target,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SuperAdminSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  isDark: boolean;
}

// Core admin suggestions (GET operations - data retrieval)
const CORE_ADMIN_SUGGESTIONS = [
  {
    id: "analytics",
    text: "GET_AGENT_ANALYTICS",
    displayText: "Show me analytics overview for this agent",
    description: "Get AI-powered insights and trend analysis",
    icon: BarChart3,
    category: "Analytics",
    color: "from-blue-500 to-purple-600",
    action: "GET_AGENT_ANALYTICS",
  },
  {
    id: "reports",
    text: "GET_AGENT_REPORTS",
    displayText: "Generate performance report for the last 30 days",
    description: "Complete metrics and KPI summary",
    icon: TrendingUp,
    category: "Reports",
    color: "from-green-500 to-blue-600",
    action: "GET_AGENT_REPORTS",
  },
  {
    id: "conversations",
    text: "GET_AGENT_CONVERSATIONS",
    displayText: "Show recent conversations and engagement metrics",
    description: "Conversation analytics and sentiment analysis",
    icon: MessageSquare,
    category: "Conversations",
    color: "from-purple-500 to-pink-600",
    action: "GET_AGENT_CONVERSATIONS",
  },
  {
    id: "feedback",
    text: "GET_AGENT_FEEDBACK",
    displayText: "Display feedback summary and trending issues",
    description: "User feedback analysis and action items",
    icon: MessageCircle,
    category: "Feedback",
    color: "from-orange-500 to-red-600",
    action: "GET_AGENT_FEEDBACK",
  },
  {
    id: "tasks",
    text: "GET_AGENT_TASKS",
    displayText: "Show scheduled tasks and automation status",
    description: "Task management and scheduling overview",
    icon: Calendar,
    category: "Tasks",
    color: "from-indigo-500 to-purple-600",
    action: "GET_AGENT_TASKS",
  },
  {
    id: "personality",
    text: "GET_AGENT_PERSONALITY",
    displayText: "View agent personality configuration",
    description: "Current bio, lore, style, and behavioral traits",
    icon: Brain,
    category: "Personality",
    color: "from-emerald-500 to-teal-600",
    action: "GET_AGENT_PERSONALITY",
  },
  {
    id: "settings",
    text: "GET_AGENT_CONFIG",
    displayText: "Review agent configuration and permissions",
    description: "Settings audit and optimization recommendations",
    icon: Settings,
    category: "Config",
    color: "from-gray-500 to-slate-600",
    action: "GET_AGENT_CONFIG",
  },
];

// Advanced admin suggestions (SET/UPDATE operations - data modification)
const ADVANCED_ADMIN_SUGGESTIONS = [
  {
    id: "personality-update",
    text: "UPDATE_AGENT_PERSONALITY",
    displayText: "Update agent personality configuration",
    description: "Modify bio, lore, style, and behavioral traits",
    icon: Brain,
    category: "Management",
    color: "from-violet-500 to-purple-600",
    action: "UPDATE_AGENT_PERSONALITY",
  },
  {
    id: "task-schedule",
    text: "SCHEDULE_ADMIN_TASK",
    displayText: "Schedule new administrative task",
    description: "Create automated jobs and workflows",
    icon: Calendar,
    category: "Management",
    color: "from-blue-500 to-indigo-600",
    action: "SCHEDULE_ADMIN_TASK",
  },
  {
    id: "feedback-submit",
    text: "SUBMIT_ADMIN_FEEDBACK",
    displayText: "Submit internal feedback report",
    description: "Report issues, bugs, or improvement suggestions",
    icon: MessageCircle,
    category: "Management",
    color: "from-orange-500 to-amber-600",
    action: "SUBMIT_ADMIN_FEEDBACK",
  },
  {
    id: "system-health",
    text: "GET_SYSTEM_HEALTH",
    displayText: "System health monitoring",
    description: "Check services, APIs, and infrastructure status",
    icon: Zap,
    category: "System",
    color: "from-green-500 to-emerald-600",
    action: "GET_SYSTEM_HEALTH",
  },
  {
    id: "active-users",
    text: "GET_DAILY_ACTIVE_USERS",
    displayText: "View daily active users metrics",
    description: "User engagement and growth analytics",
    icon: Users,
    category: "Analytics",
    color: "from-cyan-500 to-blue-600",
    action: "GET_DAILY_ACTIVE_USERS",
  },
  {
    id: "grant-builder",
    text: "QUALIFY_AND_GRANT_BUILDER",
    displayText: "Evaluate and grant USDC to builders",
    description: "Builder qualification and microgrant system",
    icon: Crown,
    category: "Grants",
    color: "from-yellow-500 to-orange-600",
    action: "QUALIFY_AND_GRANT_BUILDER",
  },
  {
    id: "validate-builder",
    text: "VALIDATE_BUILDER_SCORE",
    displayText: "Validate builder score on Talent Protocol",
    description: "Verify and update builder reputation scores",
    icon: Shield,
    category: "Grants",
    color: "from-emerald-500 to-green-600",
    action: "VALIDATE_BUILDER_SCORE",
  },
  {
    id: "project-ranking",
    text: "RANK_PROJECT_POTENTIAL",
    displayText: "Rank project potential and quality",
    description: "AI-powered project evaluation and scoring",
    icon: TrendingUp,
    category: "Projects",
    color: "from-purple-500 to-indigo-600",
    action: "RANK_PROJECT_POTENTIAL",
  },
  {
    id: "track-progress",
    text: "TRACK_PROJECT_PROGRESS",
    displayText: "Track project development progress",
    description: "Monitor milestones and development metrics",
    icon: Target,
    category: "Projects",
    color: "from-blue-500 to-purple-600",
    action: "TRACK_PROJECT_PROGRESS",
  },
  {
    id: "github-metrics",
    text: "EVALUATE_AND_SAVE_GITHUB_METRICS",
    displayText: "Evaluate GitHub repository metrics",
    description: "Complete analysis of code quality and activity",
    icon: Github,
    category: "Development",
    color: "from-gray-600 to-slate-700",
    action: "EVALUATE_AND_SAVE_GITHUB_METRICS",
  },
  {
    id: "demo-video",
    text: "EVALUATE_DEMO_VIDEO",
    displayText: "Evaluate and analyze demo videos",
    description: "AI-powered video content analysis and scoring",
    icon: Target,
    category: "Content",
    color: "from-pink-500 to-rose-600",
    action: "EVALUATE_DEMO_VIDEO",
  },
];

// Complete SuperAdmin suggestions (balanced GET/SET operations) - Even count for paired display
const SUPERADMIN_SUGGESTIONS = [
  ...CORE_ADMIN_SUGGESTIONS,
  ...ADVANCED_ADMIN_SUGGESTIONS,
];

export function SuperAdminSuggestions({
  onSuggestionClick,
  isDark,
}: SuperAdminSuggestionsProps) {
  return (
    <motion.div
      key="superadmin-suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 xs:mb-10 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1
          className={`text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 xs:mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          SuperAdmin Dashboard
        </h1>
        <p
          className={`text-sm xs:text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Advanced administrative tools and insights at your fingertips.
          <br className="hidden xs:block" />
          Choose an action below or ask me anything about this agent.
        </p>
      </motion.div>

      {/* Carousel Grid - Show 9 cards per row (18 total) */}
      <div className="space-y-6">
        {/* First Row - Moving Right */}
        <div className="overflow-hidden relative">
          {/* Left blur gradient */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10",
            isDark 
              ? "bg-gradient-to-r from-gray-900/40 to-transparent" 
              : "bg-gradient-to-r from-white/40 to-transparent"
          )} />
          {/* Right blur gradient */}
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10",
            isDark 
              ? "bg-gradient-to-l from-gray-900/40 to-transparent" 
              : "bg-gradient-to-l from-white/40 to-transparent"
          )} />
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...SUPERADMIN_SUGGESTIONS.slice(0, 9), ...SUPERADMIN_SUGGESTIONS.slice(0, 9)].map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              const originalIndex = index % 9;

              return (
                <motion.button
                  key={`row1-${suggestion.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: originalIndex * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className={cn(
                    "group relative p-5 rounded-2xl transition-all duration-300 text-left overflow-hidden flex-shrink-0 flex flex-col",
                    "w-72 h-44 shadow-lg hover:shadow-xl",
                    isDark
                      ? "bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700 hover:border-gray-600"
                      : "bg-white/90 hover:bg-white border border-gray-100 hover:border-gray-200"
                  )}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      `bg-gradient-to-br ${suggestion.color}`
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all duration-300",
                      `bg-gradient-to-br ${suggestion.color}`,
                      "group-hover:scale-110 group-hover:rotate-6"
                    )}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-medium",
                        isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {suggestion.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <h3
                      className={cn(
                        "font-semibold text-sm leading-tight line-clamp-2",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {suggestion.displayText}
                    </h3>

                    <p
                      className={cn(
                        "text-xs leading-relaxed line-clamp-2 flex-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {suggestion.description}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <div
                    className={cn(
                      "absolute top-4 right-4 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Second Row - Moving Left */}
        <div className="overflow-hidden relative">
          {/* Left blur gradient */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10",
            isDark 
              ? "bg-gradient-to-r from-gray-900/40 to-transparent" 
              : "bg-gradient-to-r from-white/40 to-transparent"
          )} />
          {/* Right blur gradient */}
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10",
            isDark 
              ? "bg-gradient-to-l from-gray-900/40 to-transparent" 
              : "bg-gradient-to-l from-white/40 to-transparent"
          )} />
          <motion.div
            className="flex gap-4"
            animate={{
              x: [-100, 0, -100],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...SUPERADMIN_SUGGESTIONS.slice(9, 18), ...SUPERADMIN_SUGGESTIONS.slice(9, 18)].map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              const originalIndex = index % 9;

              return (
                <motion.button
                  key={`row2-${suggestion.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (originalIndex * 0.1) + 0.9 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className={cn(
                    "group relative p-5 rounded-2xl transition-all duration-300 text-left overflow-hidden flex-shrink-0 flex flex-col",
                    "w-72 h-44 shadow-lg hover:shadow-xl",
                    isDark
                      ? "bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700 hover:border-gray-600"
                      : "bg-white/90 hover:bg-white border border-gray-100 hover:border-gray-200"
                  )}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      `bg-gradient-to-br ${suggestion.color}`
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all duration-300",
                      `bg-gradient-to-br ${suggestion.color}`,
                      "group-hover:scale-110 group-hover:rotate-6"
                    )}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-medium",
                        isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {suggestion.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <h3
                      className={cn(
                        "font-semibold text-sm leading-tight line-clamp-2",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {suggestion.displayText}
                    </h3>

                    <p
                      className={cn(
                        "text-xs leading-relaxed line-clamp-2 flex-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {suggestion.description}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <div
                    className={cn(
                      "absolute top-4 right-4 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-8 xs:mt-10 sm:mt-12"
      >
        <p
          className={cn(
            "text-xs xs:text-sm",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          Or type a custom admin command below ↓
        </p>
      </motion.div>
    </motion.div>
  );
}
