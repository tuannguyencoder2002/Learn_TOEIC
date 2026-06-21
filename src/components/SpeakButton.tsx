"use client";

import { useEffect, useState } from "react";

/** Đọc text tiếng Anh bằng Web Speech API (miễn phí, chạy trên trình duyệt). */
export function SpeakButton({
  text,
  label,
  rate = 0.9,
  className,
}: {
  text: string;
  label?: string;
  rate?: number;
  className?: string;
}) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = rate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utter);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Nghe: ${text}`}
      className={
        className ??
        `inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium transition hover:border-accent/40 hover:bg-surface ${
          speaking ? "text-accent" : "text-brand-muted"
        }`
      }
    >
      <span>{speaking ? "🔈" : "🔊"}</span>
      {label && <span>{label}</span>}
    </button>
  );
}
