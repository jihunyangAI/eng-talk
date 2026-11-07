"use client";

import { useEffect, useState } from "react";

// 브라우저 내장 음성(Web Speech API)으로 영어 단어 읽기 — 크레딧 없음
// 기기 언어가 태국어/한국어여도 영어 음성이 읽도록 en-US 음성을 직접 고름

const PREFERRED = ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Ava", "Allison"];
let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const en = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("en"));
  const us = en.filter((v) => v.lang.replace("_", "-").toLowerCase() === "en-us");
  for (const name of PREFERRED) {
    const v = us.find((x) => x.name.includes(name)) ?? en.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return us.find((v) => v.localService) ?? us[0] ?? en[0] ?? null;
}

function getVoice() {
  if (!cachedVoice) cachedVoice = pickVoice();
  return cachedVoice;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function SpeakButton({ text, label }: { text: string; label: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!canSpeak()) return;
    setSupported(true);
    // 음성 목록은 비동기로 로드되는 경우가 있음 (Chrome)
    const onVoices = () => (cachedVoice = pickVoice());
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
  }, []);

  if (!supported) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-US";
    u.rate = 0.85;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`${label}: ${text}`}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
        speaking ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
