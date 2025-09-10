"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TerminalLine {
  id: string;
  username?: string;
  message: string;
}

const TypeWriter = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
  }, [text]);

  useEffect(() => {
    if (indexRef.current < text.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + text[indexRef.current]);
        indexRef.current += 1;
      }, 15);
      return () => clearTimeout(t);
    }
  }, [displayed, text]);

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
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [cursorOn, setCursorOn] = useState(true);

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

  useEffect(() => {
    let i = 0;
    let timeout: NodeJS.Timeout | undefined;
    const addNext = () => {
      if (i >= script.length) return;
      const next = script[i];
      if (!next) return;
      setLines((prev) => [...prev, next]);
      i += 1;
      timeout = setTimeout(addNext, i === 1 ? 1200 : 1600);
    };
    addNext();
    return () => timeout && clearTimeout(timeout);
  }, [script]);

  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-[340px] md:w-[400px] rounded-xl border border-white/15 bg-white/5 backdrop-blur-[2px] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/50" />
        <div className="w-2 h-2 rounded-full bg-white/70" />
        <span className="ml-2 text-[10px] text-white/70 tracking-wider">
          moonxbt-terminal
        </span>
      </div>
      <div className="p-4 text-white text-xs leading-relaxed font-mono min-h-[120px]">
        {lines.map((line) => {
          if (!line) return null;
          return (
            <div key={line.id} className="mb-2">
              {line.username && (
                <span className="text-white/60 mr-2">[{line.username}]</span>
              )}
              <TypeWriter text={line.message} />
            </div>
          );
        })}
        {cursorOn && (
          <span className="inline-block w-2 h-4 bg-white/80 align-middle" />
        )}
      </div>
    </div>
  );
}
