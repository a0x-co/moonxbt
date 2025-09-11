"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TerminalLine {
  id: string;
  username?: string;
  message: string;
  timestamp?: string;
}

const TypeWriter = ({
  text,
  className,
  onComplete,
  intervalMs = 15,
}: {
  text: string;
  className?: string;
  onComplete?: () => void;
  intervalMs?: number;
}) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const safeText = typeof text === "string" ? text : "";
  const doneRef = useRef(false);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    doneRef.current = false;
  }, [safeText]);

  useEffect(() => {
    if (indexRef.current < safeText.length) {
      const t = setTimeout(() => {
        const i = indexRef.current;
        if (i >= safeText.length) return;
        const char = safeText.charAt(i);
        if (!char) return;
        setDisplayed((prev) => prev + char);
        indexRef.current = i + 1;
      }, intervalMs);
      return () => clearTimeout(t);
    }
    if (!doneRef.current) {
      doneRef.current = true;
      if (onComplete) onComplete();
    }
  }, [displayed, safeText, intervalMs]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-1 h-3 ml-0.5 bg-white/80 align-middle animate-pulse" />
      )}
    </span>
  );
};

// Specialized writer for multi-line ASCII banners: types all lines in parallel
const BannerWriter = ({
  lines,
  onComplete,
  intervalMs = 8,
  staggerMs = 80,
}: {
  lines: string[];
  onComplete?: () => void;
  intervalMs?: number;
  staggerMs?: number;
}) => {
  const [progress, setProgress] = useState<number[]>(() =>
    new Array(lines.length).fill(0)
  );
  const [blink, setBlink] = useState(true);
  const startRef = useRef<number>(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    setProgress(new Array(lines.length).fill(0));
    startRef.current = Date.now();
    doneRef.current = false;
  }, [lines]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setProgress((prev) => {
        const updated = [...prev];
        let changed = false;
        for (let i = 0; i < lines.length; i++) {
          const delay = i * staggerMs;
          if (now - startRef.current >= delay && updated[i] < lines[i].length) {
            updated[i] = Math.min(lines[i].length, updated[i] + 1);
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, intervalMs);

    const blinkId = setInterval(() => setBlink((b) => !b), 800);
    return () => {
      clearInterval(id);
      clearInterval(blinkId);
    };
  }, [lines, intervalMs, staggerMs]);

  useEffect(() => {
    if (doneRef.current) return;
    const finished = progress.every((p, idx) => p >= lines[idx].length);
    if (finished) {
      doneRef.current = true;
      onComplete && onComplete();
    }
  }, [progress, lines, onComplete]);

  return (
    <div className="whitespace-pre font-mono text-white/80 tracking-wide xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px]">
      {lines.map((ln, i) => {
        const p = progress[i];
        const showing = ln.slice(0, p);
        const done = p >= ln.length;
        return (
          <div key={`banner-line-${i}`}>
            {showing}
            {!done && (
              <span
                className={`inline-block h-4 w-1 align-middle ml-1 ${
                  blink ? "bg-white/80" : "bg-transparent"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function TerminalSnippet() {
  const [completedLines, setCompletedLines] = useState<TerminalLine[]>([]);
  const [currentLine, setCurrentLine] = useState<TerminalLine | null>(null);
  const [cursorOn, setCursorOn] = useState(true);
  const startedRef = useRef(false);
  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const script = useMemo<TerminalLine[]>(
    () => [
      {
        id: "l1",
        username: "builder",
        message:
          "I will create a short video of your product and post it on X, Farcaster, Telegram, Tiktok and Instagram... ",
      },
      {
        id: "l2",
        username: "agentbot",
        message: "Everyday there's a new auction for tomorrow's video...",
      },
      {
        id: "l3",
        username: "agentbot",
        message:
          "Training knowledge... Unique personality... Connecting to data sources... ",
      },
      { id: "l4", username: "agentbot", message: "Deploying..." },
    ],
    []
  );

  const bannerLines = useMemo(
    () => [
      "                                             /$$   /$$ /$$$$$$$  /$$$$$$$$",
      "                                            | $$  / $$| $$__  $$|__  $$__/",
      " /$$$$$$/$$$$   /$$$$$$   /$$$$$$  /$$$$$$$ |  $$/ $$/| $$    $$   | $$   ",
      "| $$_  $$_  $$ /$$__  $$ /$$__  $$| $$__  $$    $$$$/ | $$$$$$$    | $$",
      "| $$   $$   $$| $$    $$| $$    $$| $$    $$  >$$  $$ | $$__  $$   | $$",
      "| $$ | $$ | $$| $$  | $$| $$  | $$| $$  | $$ /$$/   $$| $$    $$   | $$ ",
      "| $$ | $$ | $$|  $$$$$$/|  $$$$$$/| $$  | $$| $$    $$| $$$$$$$/   | $$",
      "|__/ |__/ |__/  ______/   ______/ |__/  |__/|__/  |__/|_______/    |__/",
    ],
    []
  );
  const bannerText = useMemo(() => bannerLines.join("\n"), [bannerLines]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const combined: TerminalLine[] = [
      ...script.map((l) => ({ ...l, timestamp: getTimestamp() })),
      { id: "banner", message: bannerText },
    ];

    const first = combined[0];
    if (first) setCurrentLine(first);
    remainingRef.current = combined.slice(1);
    // Do not include bannerText as a dependency to avoid re-running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  const remainingRef = useRef<TerminalLine[]>([]);

  const handleLineComplete = () => {
    if (!currentLine) return;
    const finished = currentLine;
    setCurrentLine(null);
    setCompletedLines((prev) => [...prev, finished]);
    const next = remainingRef.current.shift();
    if (next) {
      const delayMs = next.id === "banner" ? 600 : 250;
      setTimeout(
        () => setCurrentLine({ ...next, timestamp: getTimestamp() }),
        delayMs
      );
    }
  };

  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="xl:w-[460px] 2xl:w-[576px] 3xl:w-[636px] text-white/80">
      <div className="xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px] leading-relaxed">
        {completedLines.map((line) => {
          if (!line) return null;
          return (
            <div key={line.id} className="mb-2">
              {(line.timestamp || line.username) && (
                <div className="flex items-baseline gap-2">
                  {line.timestamp && (
                    <span className="text-white/40 font-mono xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px]">
                      [{line.timestamp}]
                    </span>
                  )}
                  {line.username && (
                    <span className="text-white/70 font-bold tracking-wider xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px] font-orbitron">
                      {line.username}:
                    </span>
                  )}
                </div>
              )}
              <span
                className={`text-white/80 font-mono tracking-wide xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px] ${
                  line.id === "banner"
                    ? "whitespace-pre"
                    : "whitespace-pre-wrap break-words"
                }`}
              >
                {line.message}
              </span>
            </div>
          );
        })}
        {currentLine && (
          <div key={currentLine.id} className="mb-2">
            {currentLine.id !== "banner" && (
              <div className="flex items-baseline gap-2">
                {currentLine.timestamp && (
                  <span className="text-white/40 font-mono xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px]">
                    [{currentLine.timestamp}]
                  </span>
                )}
                {currentLine.username && (
                  <span className="text-white/70 font-bold tracking-wider xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px] font-orbitron">
                    {currentLine.username}:
                  </span>
                )}
              </div>
            )}
            {currentLine.id === "banner" ? (
              <BannerWriter
                lines={bannerLines}
                onComplete={handleLineComplete}
                intervalMs={8}
                staggerMs={80}
              />
            ) : (
              <TypeWriter
                text={currentLine.message}
                className="text-white/80 font-mono tracking-wide xl:text-[9px] 2xl:text-[10px] 3xl:text-[12px] whitespace-pre-wrap break-words"
                onComplete={handleLineComplete}
                intervalMs={15}
              />
            )}
          </div>
        )}
        <span
          className={`inline-block h-4 w-1 ml-2 align-middle ${
            cursorOn ? "bg-white/80 opacity-100" : "bg-transparent opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
