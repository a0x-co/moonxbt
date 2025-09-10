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
}: {
  text: string;
  className?: string;
  onComplete?: () => void;
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
      }, 15);
      return () => clearTimeout(t);
    }
    if (!doneRef.current) {
      doneRef.current = true;
      if (onComplete) onComplete();
    }
  }, [displayed, safeText]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-1 h-3 ml-0.5 bg-white/80 align-middle animate-pulse" />
      )}
    </span>
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

  const bannerLines = [
    "                                             /$$   /$$ /$$$$$$$  /$$$$$$$$",
    "                                            | $$  / $$| $$__  $$|__  $$__/",
    " /$$$$$$/$$$$   /$$$$$$   /$$$$$$  /$$$$$$$ |  $$/ $$/| $$    $$   | $$   ",
    "| $$_  $$_  $$ /$$__  $$ /$$__  $$| $$__  $$    $$$$/ | $$$$$$$    | $$",
    "| $$   $$   $$| $$    $$| $$    $$| $$    $$  >$$  $$ | $$__  $$   | $$",
    "| $$ | $$ | $$| $$  | $$| $$  | $$| $$  | $$ /$$/   $$| $$    $$   | $$ ",
    "| $$ | $$ | $$|  $$$$$$/|  $$$$$$/| $$  | $$| $$    $$| $$$$$$$/   | $$",
    "|__/ |__/ |__/  ______/   ______/ |__/  |__/|__/  |__/|_______/    |__/",
  ];
  const bannerText = bannerLines.join("\n");

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
  }, [script, bannerText]);

  const remainingRef = useRef<TerminalLine[]>([]);

  const handleLineComplete = () => {
    if (currentLine) {
      setCompletedLines((prev) => [...prev, currentLine]);
    }
    const next = remainingRef.current.shift();
    if (next) {
      setTimeout(
        () => setCurrentLine({ ...next, timestamp: getTimestamp() }),
        350
      );
    } else {
      setCurrentLine(null);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-[468px] md:w-[676px] text-white/80">
      <div className="px-1 py-1 text-xs leading-relaxed">
        {completedLines.map((line) => {
          if (!line) return null;
          return (
            <div key={line.id} className="mb-2">
              <div className="flex items-baseline gap-2">
                {line.timestamp && (
                  <span className="text-white/40 font-mono text-[10px]">
                    [{line.timestamp}]
                  </span>
                )}
                {line.username && (
                  <span className="text-white/70 font-bold tracking-wider text-[10px] font-orbitron">
                    {line.username}:
                  </span>
                )}
              </div>
              <span
                className={`text-white/80 font-mono tracking-wide text-[11px] md:text-[12px] ${
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
            <div className="flex items-baseline gap-2">
              {currentLine.timestamp && (
                <span className="text-white/40 font-mono text-[10px]">
                  [{currentLine.timestamp}]
                </span>
              )}
              {currentLine.username && (
                <span className="text-white/70 font-bold tracking-wider text-[10px] font-orbitron">
                  {currentLine.username}:
                </span>
              )}
            </div>
            <TypeWriter
              text={currentLine.message}
              className={`text-white/80 font-mono tracking-wide text-[11px] md:text-[12px] ${
                currentLine.id === "banner"
                  ? "whitespace-pre"
                  : "whitespace-pre-wrap break-words"
              }`}
              onComplete={handleLineComplete}
            />
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
