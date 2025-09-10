"use client";

import Image from "next/image";
import cursorImg from "./png/Cursor_1@2x-8.png";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [x, setX] = useState(-100);
  const [y, setY] = useState(-100);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setX(e.clientX);
      setY(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onDown as EventListener);
      window.removeEventListener("touchend", onUp as EventListener);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] select-none"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${
          pressed ? 0.9 : 1
        })`,
        transition: "transform 120ms ease, opacity 150ms ease",
        willChange: "transform",
        opacity: visible ? 1 : 0,
      }}
    >
      <Image src={cursorImg} alt="" width={96} height={96} />
    </div>
  );
}
