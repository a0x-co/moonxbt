"use client";

/**
 * MoonXBT Video Studio
 * Route: /moonxbt/video
 *
 * Admin tool for generating Moon's daily videos using Grok Imagine + TTS.
 * Tone and enthusiasm can be tuned before generating.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiVideoLine,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiSettings3Line,
  RiSparklingLine,
  RiAlertLine,
} from "react-icons/ri";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "subtle" | "balanced" | "bold";
type AspectRatio = "9:16" | "16:9" | "1:1";

interface VideoJob {
  jobId: string;
  status: "pending" | "processing" | "complete" | "failed";
  videoUrl?: string;
  audioBase64?: string;
  audioContentType?: string;
  promptUsed?: string;
  scriptUsed?: string;
  error?: string;
  createdAt?: string;
  videoUrlExpiresAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "subtle", label: "Subtle", desc: "Soft sell, calm delivery" },
  { value: "balanced", label: "Balanced", desc: "Confident and clear" },
  { value: "bold", label: "Bold", desc: "Punchy, sales-forward" },
];
const ENTHUSIASM_LEVELS = ["🙂", "😄", "😁", "🤩", "🚀"];

const API_BASE = process.env.NEXT_PUBLIC_MOONXBT_API_URL ?? "/api/moonxbt";
const POLL_INTERVAL_MS = 4000;
const STORAGE_KEY = "moonxbt_video_jobs";
const SELECTED_STORAGE_KEY = "moonxbt_selected_video";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VideoJob["status"] }) {
  const map = {
    pending:    { label: "Pending",    cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    processing: { label: "Processing", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    complete:   { label: "Complete",   cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    failed:     { label: "Failed",     cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {status === "processing" && <RiLoader4Line className="w-3 h-3 animate-spin" />}
      {status === "complete"   && <RiCheckLine   className="w-3 h-3" />}
      {status === "failed"     && <RiCloseLine   className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function InlineAudioPlayer({ base64, contentType }: { base64: string; contentType: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const src = `data:${contentType};base64,${base64}`;

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  }, [playing]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-violet-500/20 hover:bg-violet-500/30 flex items-center justify-center text-violet-300 transition-colors flex-shrink-0"
      >
        {playing ? <RiPauseCircleLine className="w-5 h-5" /> : <RiPlayCircleLine className="w-5 h-5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/70">Moon&apos;s Voice (TTS)</p>
        <p className="text-[10px] text-white/30 mt-0.5">Generated via Grok TTS API</p>
      </div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
    </div>
  );
}

// ─── Job Result Card ──────────────────────────────────────────────────────────

function JobResultCard({
  job,
  selected,
  onSelect,
  disableActions,
}: {
  job: VideoJob;
  selected: boolean;
  onSelect: (jobId: string) => void;
  disableActions: boolean;
}) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Job <code className="font-mono text-xs text-white/50">{job.jobId.slice(0, 16)}...</code>
          </p>
          {job.createdAt && (
            <p className="text-[10px] text-white/30 mt-0.5">
              {new Date(job.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Script preview */}
      {job.scriptUsed && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Moon&apos;s Script</p>
          <p className="text-sm text-white/70 leading-relaxed italic">&ldquo;{job.scriptUsed}&rdquo;</p>
        </div>
      )}

      {/* Audio */}
      {job.audioBase64 && job.audioContentType && (
        <InlineAudioPlayer base64={job.audioBase64} contentType={job.audioContentType} />
      )}

      {/* Video */}
      {job.videoUrl && (
        <div className="space-y-2">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Generated Video</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className="w-full rounded-xl border border-white/10 max-h-[560px] object-cover bg-black"
            src={job.videoUrl}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            playsInline
            loop
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="flex items-center justify-between text-[10px] text-white/30">
            <span>
              {job.videoUrlExpiresAt
                ? `Preview link expires ${new Date(job.videoUrlExpiresAt).toLocaleTimeString()}`
                : "Preview is watermarked"}
            </span>
            {job.status === "complete" && (
              <button
                type="button"
                onClick={() => onSelect(job.jobId)}
                disabled={disableActions}
                className={`px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider ${
                  selected
                    ? "border-emerald-400/60 text-emerald-300 bg-emerald-500/10"
                    : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/30"
                } ${disableActions ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {selected ? "Selected" : "Use this video"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {job.status === "failed" && job.error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <RiAlertLine className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300/80">{job.error}</p>
        </div>
      )}

      {/* Toggle prompt */}
      {job.promptUsed && (
        <div>
          <button
            onClick={() => setShowPrompt((p) => !p)}
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors underline"
          >
            {showPrompt ? "Hide" : "Show"} raw prompt
          </button>
          <AnimatePresence>
            {showPrompt && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-[10px] text-white/30 font-mono bg-white/[0.03] p-3 rounded-lg border border-white/[0.05] overflow-x-auto leading-relaxed whitespace-pre-wrap"
              >
                {job.promptUsed}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MoonXBTVideoStudio() {
  // Form state
  const [userPrompt, setUserPrompt] = useState("");
  const [tone, setTone] = useState<Tone>("balanced");
  const [enthusiasmLevel, setEnthusiasmLevel] = useState(3);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Job tracking
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [generating, setGenerating] = useState(false);
  const pollingRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const isProcessing = generating || jobs.some((job) => job.status === "pending" || job.status === "processing");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // ─── Polling ───────────────────────────────────────────────────────────────

  const pollJob = useCallback(
    (jobId: string) => {
      if (pollingRef.current.has(jobId)) return;

      const intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/video/${jobId}`);
          if (!res.ok) return;

          const data = await res.json();
          const job: VideoJob = {
            jobId,
            status: data.job?.status ?? "pending",
            videoUrl: data.job?.videoUrl,
            audioBase64: data.job?.audioBase64,
            audioContentType: data.job?.audioContentType,
            promptUsed: data.job?.promptUsed,
            scriptUsed: data.job?.scriptUsed,
            error: data.job?.error,
            createdAt: data.job?.createdAt,
            videoUrlExpiresAt: data.job?.videoUrlExpiresAt,
          };

          setJobs((prev) => prev.map((j) => (j.jobId === jobId ? job : j)));

          if (job.status === "complete" || job.status === "failed") {
            clearInterval(pollingRef.current.get(jobId));
            pollingRef.current.delete(jobId);
          }
        } catch (e) {
          console.error("Poll error:", e);
        }
      }, POLL_INTERVAL_MS);

      pollingRef.current.set(jobId, intervalId);
    },
    []
  );

  const referencePreview = "/assets/moonxbt/refs/1.png";

  // ─── Load stored jobs on refresh ──────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let storedIds: string[] = [];
    try {
      storedIds = JSON.parse(raw) as string[];
    } catch {
      storedIds = [];
    }

    if (!storedIds.length) return;

    setJobs((prev) => {
      const existing = new Set(prev.map((j) => j.jobId));
      const placeholders = storedIds
        .filter((id) => !existing.has(id))
        .map((id) => ({ jobId: id, status: "pending" as const }));
      return [...placeholders, ...prev];
    });

    storedIds.forEach(async (id) => {
      try {
        const res = await fetch(`${API_BASE}/video/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const job: VideoJob = {
          jobId: id,
          status: data.job?.status ?? "pending",
          videoUrl: data.job?.videoUrl,
          audioBase64: data.job?.audioBase64,
          audioContentType: data.job?.audioContentType,
          promptUsed: data.job?.promptUsed,
          scriptUsed: data.job?.scriptUsed,
          error: data.job?.error,
          createdAt: data.job?.createdAt,
          videoUrlExpiresAt: data.job?.videoUrlExpiresAt,
        };
        setJobs((prev) => prev.map((j) => (j.jobId === id ? job : j)));

        if (job.status === "pending" || job.status === "processing") {
          pollJob(id);
        }
      } catch (e) {
        console.error("Resume job error:", e);
      }
    });
  }, [pollJob]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = Array.from(new Set(jobs.map((job) => job.jobId)));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [jobs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawSelected = window.localStorage.getItem(SELECTED_STORAGE_KEY);
    if (rawSelected) {
      setSelectedJobId(rawSelected);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedJobId) {
      window.localStorage.setItem(SELECTED_STORAGE_KEY, selectedJobId);
    } else {
      window.localStorage.removeItem(SELECTED_STORAGE_KEY);
    }
  }, [selectedJobId]);

  // ─── Generate Video ────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!userPrompt.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch(`${API_BASE}/video/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          tone,
          enthusiasmLevel,
          durationSeconds,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start generation");

      const newJob: VideoJob = {
        jobId: data.jobId,
        status: "pending",
        promptUsed: data.promptUsed,
        scriptUsed: data.scriptUsed,
        createdAt: new Date().toISOString(),
      };

      setJobs((prev) => [newJob, ...prev]);
      pollJob(data.jobId);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }, [
    userPrompt,
    tone,
    enthusiasmLevel,
    durationSeconds,
    aspectRatio,
    pollJob,
  ]);

  const handleSelectJob = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-pink-600/8 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Moon Video Studio</h1>
            </div>
            <p className="text-sm text-white/40">
              Generate daily MoonXBT clips with Grok Imagine + TTS
            </p>
          </div>
          <div className="text-[10px] text-white/20 text-right">
            <p>Model: grok-imagine-video</p>
            <p>Voice: Grok TTS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* ─── Left: Controls ─────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Prompt */}
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-2">
              <label className="text-[10px] text-white/40 uppercase tracking-widest">
                Auction Winner&apos;s Prompt / Project Description
              </label>
              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g. 'We're building a decentralized prediction market on Base. Help us go viral!'"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[10px] text-white/25">
                {userPrompt.length}/300 chars - first 300 chars used in prompt
              </p>
              <p className="text-[10px] text-white/25">
                Moon's appearance is fixed and reinforced by internal reference images.
              </p>
            </div>

            {/* Tone + Enthusiasm */}
            <div className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-4">
              <label className="text-[10px] text-white/40 uppercase tracking-widest">
                Sales Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    disabled={isProcessing}
                    className={`rounded-xl border px-3 py-3 text-left transition-all ${
                      tone === t.value
                        ? "border-violet-400/60 bg-violet-500/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white/80"
                    }`}
                  >
                    <p className="text-xs font-semibold">{t.label}</p>
                    <p className="text-[10px] text-white/40 mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/50">
                  Enthusiasm Level
                </label>
                <div className="flex items-center gap-2">
                  {ENTHUSIASM_LEVELS.map((emoji, idx) => {
                    const level = idx + 1;
                    const active = enthusiasmLevel === level;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEnthusiasmLevel(level)}
                        disabled={isProcessing}
                        className={`w-10 h-10 rounded-full border text-lg transition-colors ${
                          active
                            ? "border-violet-400/60 bg-violet-500/20"
                            : "border-white/10 bg-white/[0.04] hover:border-white/30"
                        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        aria-label={`Enthusiasm level ${level}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Advanced */}
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                disabled={isProcessing}
                className="w-full flex items-center justify-between px-4 py-3 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
              >
                <span className="flex items-center gap-2"><RiSettings3Line className="w-3.5 h-3.5" /> Advanced options</span>
                <span>{showAdvanced ? "▲" : "▼"}</span>
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Aspect Ratio</label>
                        <div className="flex gap-2">
                          {(["9:16", "16:9", "1:1"] as AspectRatio[]).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setAspectRatio(r)}
                              disabled={isProcessing}
                              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                                aspectRatio === r
                                  ? "border-violet-400/60 bg-violet-500/20 text-white"
                                  : "border-white/10 bg-white/[0.04] text-white/40 hover:text-white/60"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isProcessing || !userPrompt.trim()}
                onClick={handleGenerate}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                  bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
                  shadow-[0_4px_24px_-4px_rgba(139,92,246,0.5)] hover:shadow-[0_4px_32px_-4px_rgba(139,92,246,0.7)]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                  active:scale-[0.98]
                `}
              >
                {generating ? (
                  <><RiLoader4Line className="w-4 h-4 animate-spin" /> Starting...</>
                ) : isProcessing ? (
                  <><RiLoader4Line className="w-4 h-4 animate-spin" /> Waiting...</>
                ) : (
                  <><RiVideoLine className="w-4 h-4" /> Generate Video</>
                )}
              </button>
            </div>

            {/* Info box */}
            <div className="flex gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <RiSparklingLine className="w-4 h-4 text-violet-300/60 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/30 leading-relaxed">
                Moon&apos;s appearance stays fixed across all videos. You can only adjust the sales tone
                and enthusiasm level. Generation is async and usually takes a few minutes; the page
                auto-polls every 4 seconds. If you&apos;ve already generated a strong clip, select it
                from the right panel to reuse it on future auctions.
              </p>
            </div>
          </div>

          {/* ─── Right: Job Results ─────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/60">
                {jobs.length > 0 ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""}` : "No jobs yet"}
              </h2>
              {jobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setJobs([]);
                    setSelectedJobId(null);
                  }}
                  className="text-xs text-white/25 hover:text-white/50 transition-colors flex items-center gap-1"
                >
                  <RiRefreshLine className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {selectedJobId && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200/80">
                Selected for submission:{" "}
                <span className="font-mono">{selectedJobId.slice(0, 12)}...</span>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {jobs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-3 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-white/[0.06] flex items-center justify-center text-3xl">
                    M
                  </div>
                  <p className="text-sm text-white/25">Your generated videos will appear here.</p>
                  <p className="text-[10px] text-white/15">Each video takes ~2-5 minutes.</p>
                </motion.div>
              ) : (
                jobs.map((job) => (
                  <JobResultCard
                    key={job.jobId}
                    job={job}
                    selected={selectedJobId === job.jobId}
                    onSelect={handleSelectJob}
                    disableActions={isProcessing}
                  />
                ))
              )}
            </AnimatePresence>

            {referencePreview && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                  Primary Reference Image
                </p>
                <img
                  src={referencePreview}
                  alt="Reference"
                  className="w-full rounded-xl border border-white/10 object-cover max-h-[260px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
