"use client";

// 브라우저 음성인식(Web Speech API) 래퍼 — Chrome/Edge/Safari 지원

type RecognitionAlternative = { transcript: string; confidence: number };
type RecognitionResult = { isFinal: boolean; length: number; [i: number]: RecognitionAlternative };
type RecognitionEvent = { resultIndex: number; results: { length: number; [i: number]: RecognitionResult } };
type RecognitionErrorEvent = { error: string };

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

export type SpeechSupport = "ok" | "unsupported" | "insecure";
export type SpeechErrorCode = "no-speech" | "mic-denied" | "failed";

export function getSpeechSupport(): SpeechSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition ? "ok" : "unsupported";
}

export type ListenHandlers = {
  onInterim: (text: string) => void;
  onFinal: (candidates: string[]) => void;
  onError: (code: SpeechErrorCode) => void;
  onEnd: () => void;
};

/** 한 문장 듣기 시작. 반환값으로 중지 가능 */
export function listenOnce(h: ListenHandlers): { stop: () => void } {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) {
    h.onError("failed");
    h.onEnd();
    return { stop: () => {} };
  }

  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;

  let gotFinal = false;
  let errored = false;

  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) {
        gotFinal = true;
        const candidates: string[] = [];
        for (let k = 0; k < r.length; k++) candidates.push(r[k].transcript.trim());
        h.onFinal(candidates);
      } else {
        interim += r[0].transcript;
      }
    }
    if (interim) h.onInterim(interim.trim());
  };
  rec.onerror = (e) => {
    errored = true;
    if (e.error === "no-speech" || e.error === "aborted") h.onError("no-speech");
    else if (e.error === "not-allowed" || e.error === "service-not-allowed") h.onError("mic-denied");
    else h.onError("failed");
  };
  rec.onend = () => {
    if (!gotFinal && !errored) h.onError("no-speech");
    h.onEnd();
  };

  try {
    rec.start();
  } catch {
    h.onError("failed");
    h.onEnd();
  }
  return { stop: () => rec.stop() };
}
