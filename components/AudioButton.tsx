"use client";

import { useEffect, useRef, useState } from "react";
import { playExclusive } from "@/lib/audio";

export function AudioButton({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = () => {
    if (!audioRef.current) {
      const a = new Audio(src);
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("play", () => setPlaying(true));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (!a.paused) {
      a.pause();
      return;
    }
    // 음성인식 전에 오디오가 해제됐을 수 있으므로 매번 src를 다시 지정
    if (a.getAttribute("src") !== src) a.src = src;
    a.currentTime = 0;
    void playExclusive(a).catch(() => setPlaying(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
        playing ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
      }`}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
