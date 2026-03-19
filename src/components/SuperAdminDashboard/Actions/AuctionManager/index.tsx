"use client";

import { useCallback, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { AdminContainer } from "../../Shared/AdminContainer";
import { toast } from "@/components/shadcn/use-toast";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

type AuctionFormState = {
  agentId: string;
  scheduleTime: string;
  tweetText: string;
  winnerPrompt: string;
  projectName: string;
  bidderAddress: string;
  bidAmount: string;
  videoUrls: string;
  audioUrl: string;
  mood: string;
  notes: string;
};

const defaultForm = (agentId: string): AuctionFormState => ({
  agentId,
  scheduleTime: "",
  tweetText: "",
  winnerPrompt: "",
  projectName: "",
  bidderAddress: "",
  bidAmount: "",
  videoUrls: "",
  audioUrl: "",
  mood: "",
  notes: "",
});

export function AuctionManager({ agent }: { agent: Agent }) {
  const { getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address ?? "";
  const [form, setForm] = useState<AuctionFormState>(
    defaultForm(agent.agentId || "")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);

  const parsedVideoUrls = useMemo(
    () =>
      form.videoUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
    [form.videoUrls]
  );

  const updateField = useCallback(
    (key: keyof AuctionFormState, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const adminHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-wallet-address": walletAddress,
    };
  }, [getAccessToken, walletAddress]);

  const handleSubmit = useCallback(async () => {
    if (!form.tweetText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing tweet text",
        description: "Add the tweet copy before scheduling.",
      });
      return;
    }

    if (!form.scheduleTime) {
      toast({
        variant: "destructive",
        title: "Missing schedule time",
        description: "Choose when this post should go live.",
      });
      return;
    }

    setIsSubmitting(true);
    setLastTaskId(null);

    try {
      const headers = await adminHeaders();
      const payload = {
        agentId: form.agentId,
        scheduleTime: new Date(form.scheduleTime).toISOString(),
        tweetText: form.tweetText.trim(),
        winnerPrompt: form.winnerPrompt.trim() || undefined,
        projectName: form.projectName.trim() || undefined,
        bidderAddress: form.bidderAddress.trim() || undefined,
        bidAmount: form.bidAmount.trim() || undefined,
        videoUrls: parsedVideoUrls.length > 0 ? parsedVideoUrls : undefined,
        audioUrl: form.audioUrl.trim() || undefined,
        mood: form.mood.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      const res = await fetch("/api/moonxbt/auction/schedule", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule auction post");
      }

      setLastTaskId(data.taskId || null);
      toast({
        title: "Auction post scheduled",
        description: data.message || "Scheduled tweet created successfully.",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Scheduling failed",
        description:
          err instanceof Error ? err.message : "Failed to schedule the post.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [adminHeaders, form, parsedVideoUrls]);

  return (
    <AdminContainer
      title="Auction Manager"
      subtitle="Schedule the daily MoonXBT auction winner post and attach media metadata."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Agent ID
              </label>
              <input
                value={form.agentId}
                onChange={(e) => updateField("agentId", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
                placeholder="agent-id"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Schedule Time
              </label>
              <input
                type="datetime-local"
                value={form.scheduleTime}
                onChange={(e) => updateField("scheduleTime", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Tweet Text
            </label>
            <textarea
              rows={4}
              value={form.tweetText}
              onChange={(e) => updateField("tweetText", e.target.value)}
              className={cn(
                "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              )}
              placeholder="Write the exact tweet copy for the auction winner."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Winner Prompt
            </label>
            <textarea
              rows={3}
              value={form.winnerPrompt}
              onChange={(e) => updateField("winnerPrompt", e.target.value)}
              className={cn(
                "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              )}
              placeholder="Raw prompt submitted by the auction winner."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Project Name
              </label>
              <input
                value={form.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
                placeholder="Project or meme name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Bid Amount (USDC)
              </label>
              <input
                value={form.bidAmount}
                onChange={(e) => updateField("bidAmount", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
                placeholder="e.g. 420.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Bidder Address
              </label>
              <input
                value={form.bidderAddress}
                onChange={(e) => updateField("bidderAddress", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Mood</label>
              <input
                value={form.mood}
                onChange={(e) => updateField("mood", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                  "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                )}
                placeholder="sassy, enthusiastic, annoyed..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Video URLs (one per line)
            </label>
            <textarea
              rows={3}
              value={form.videoUrls}
              onChange={(e) => updateField("videoUrls", e.target.value)}
              className={cn(
                "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              )}
              placeholder="https://...mp4"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Audio URL</label>
            <input
              value={form.audioUrl}
              onChange={(e) => updateField("audioUrl", e.target.value)}
              className={cn(
                "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              )}
              placeholder="https://...mp3"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className={cn(
                "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800",
                "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              )}
              placeholder="Optional internal notes for the team."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !walletAddress}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white",
                "bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm",
                "hover:from-blue-500 hover:to-purple-500 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Auction Post"}
            </button>
            {!walletAddress && (
              <span className="text-xs text-gray-500">
                Connect your admin wallet to schedule.
              </span>
            )}
            {lastTaskId && (
              <span className="text-xs text-gray-500">
                Task ID: {lastTaskId.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Preview Summary
            </h3>
            <div className="mt-3 space-y-2 text-xs text-gray-600">
              <div>
                <span className="font-medium text-gray-700">Schedule:</span>{" "}
                {form.scheduleTime ? new Date(form.scheduleTime).toString() : "--"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Tweet:</span>{" "}
                {form.tweetText ? form.tweetText : "--"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Prompt:</span>{" "}
                {form.winnerPrompt ? form.winnerPrompt : "--"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Media:</span>{" "}
                {parsedVideoUrls.length > 0 ? `${parsedVideoUrls.length} video(s)` : "--"}
              </div>
            </div>
          </div>

          {parsedVideoUrls[0] && (
            <div className="rounded-xl border border-gray-100 overflow-hidden bg-black">
              <video
                className="w-full max-h-[320px] object-cover"
                src={parsedVideoUrls[0]}
                controls
                playsInline
              />
            </div>
          )}
        </div>
      </div>
    </AdminContainer>
  );
}
