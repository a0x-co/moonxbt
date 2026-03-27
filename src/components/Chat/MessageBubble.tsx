import * as React from "react";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: "user" | "agent";
  theme?: "light" | "dark";
  children: React.ReactNode;
};

export function MessageBubble({ role, children }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3",
        role === "user"
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-900",
      )}
    >
      {children}
    </div>
  );
}
