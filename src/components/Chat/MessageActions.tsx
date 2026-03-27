import * as React from "react";

type MessageActionsProps = {
  theme?: "light" | "dark";
  messageRole: "user" | "agent";
  onLike: () => void;
  onDislike: () => void;
  onCopy: () => void;
};

export function MessageActions({
  onLike,
  onDislike,
  onCopy,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white p-2 shadow-sm">
      <button type="button" onClick={onLike}>
        Like
      </button>
      <button type="button" onClick={onDislike}>
        Dislike
      </button>
      <button type="button" onClick={onCopy}>
        Copy
      </button>
    </div>
  );
}
