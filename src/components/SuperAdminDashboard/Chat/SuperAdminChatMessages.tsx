"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuperAdminChatMessage } from "@/types/superadmin-chat";
import { MessageBubble } from "@/components/Chat/MessageBubble";
import { TypingIndicator } from "@/components/Chat/TypingIndicator";
import { MessageActions } from "@/components/Chat/MessageActions";
import { JesseXBTAvatar } from "@/components/Avatar";
import { AdminComponentRenderer } from "./AdminComponentRenderer";
import { useState, useEffect } from "react";
import { Theme } from "@/hooks/use-theme";

interface SuperAdminChatMessagesProps {
  messages: SuperAdminChatMessage[];
  hoveredMessage: string | null;
  setHoveredMessage: (id: string | null) => void;
  theme: Theme;
  onLikeMessage: (messageId: string) => void;
  onDislikeMessage: (messageId: string) => void;
  onCopyMessage: (content: string) => void;
}

export function SuperAdminChatMessages({
  messages,
  hoveredMessage,
  setHoveredMessage,
  theme,
  onLikeMessage,
  onDislikeMessage,
  onCopyMessage,
}: SuperAdminChatMessagesProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      key="superadmin-messages"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8 max-w-4xl mx-auto px-2 xs:px-3 sm:px-4"
    >
      {messages.map((chat, index) => (
        <motion.div
          key={chat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={cn(
            "flex gap-2 xs:gap-3 sm:gap-4 relative group",
            chat.role === "user" ? "justify-end" : "justify-start"
          )}
          onMouseEnter={() => setHoveredMessage(chat.id)}
          onMouseLeave={() => setHoveredMessage(null)}
        >
          {chat.role === "agent" && (
            <div className="flex-shrink-0 mt-1 relative">
              <JesseXBTAvatar
                size={isMobile ? 28 : 32}
                className="shadow-md border border-white/10"
                showLoadingState={true}
                showErrorState={true}
                priority={false}
                fallbackUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9InVybCgjZ3JhZCkiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPko8L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjOEI1Q0Y2IiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzQjgyRjYiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+"
              />
              {/* SuperAdmin Crown Indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            </div>
          )}

          <div className="relative flex items-start max-w-full">
            <div className="flex flex-col gap-2 max-w-full">
              {/* Text Message */}

              <MessageBubble role={chat.role} theme={theme}>
                <div className="space-y-3">
                  {/* Text content */}
                  {chat.content && (
                    <div className="whitespace-pre-wrap leading-relaxed text-xs xs:text-sm sm:text-base word-break">
                      {chat.isThinking ? (
                        <TypingIndicator theme={theme} />
                      ) : (
                        chat.content
                      )}
                    </div>
                  )}
                </div>
              </MessageBubble>

              {/* Admin Component Renderer */}
              {chat.metadata && !chat.isThinking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="max-w-full"
                >
                  <AdminComponentRenderer
                    metadata={chat.metadata}
                    data={chat.metadata.data} // Pass data from metadata if available
                    compact={true}
                    theme={theme}
                  />
                </motion.div>
              )}
            </div>

            {/* Message Actions - Hide on mobile for better UX */}
            <AnimatePresence>
              {hoveredMessage === chat.id && !chat.isThinking && !isMobile && (
                <div
                  className={`absolute z-20 ${
                    chat.role === "user"
                      ? "right-full mr-2 sm:mr-4 top-0"
                      : "left-full ml-2 sm:ml-4 top-0"
                  }`}
                >
                  <MessageActions
                    theme={theme}
                    messageRole={chat.role}
                    onLike={() => onLikeMessage(chat.id)}
                    onDislike={() => onDislikeMessage(chat.id)}
                    onCopy={() => onCopyMessage(chat.content)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          {chat.role === "user" && (
            <div
              className={`${
                isMobile ? "w-7 h-7" : "w-8 h-8"
              } rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 relative`}
            >
              <span className="text-white text-xs font-semibold">A</span>
              {/* Admin indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
