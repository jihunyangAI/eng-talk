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
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

export type SpeechSupport = "ok" | "unsupported" | "insecure";
export type SpeechErrorCode = "no-speech" | "mic-denied" | "network" | "audio-capture" | "failed";

function getCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function getSpeechSupport(): SpeechSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  return getCtor() ? "ok" : "unsupported";
}

export type ListenHandlers = {
  /** 마이크가 실제로 켜져서 말해도 되는 시점 */
  onReady: () => void;
  onInterim: (text: string) => void;
  onFinal: (candidates: string[]) => void;
  onError: (code: SpeechErrorCode, raw: string) => void;
  onEnd: () => void;
};

export type ListenOptions = {
  /** 직전에 소리가 재생 중이었으면 오디오 전환 시간을 주기 위해 기다렸다 시작 (특히 iOS) */
  delayMs?: number;
  /** 말이 끊긴 뒤 이만큼 조용하면 자동 종료 (iOS Safari는 스스로 끝내지 않음) */
  silenceMs?: number;
  /** 마이크가 켜진 뒤 이만큼 아무 말도 인식되지 않으면 종료 */
  noSpeechMs?: number;
  /** 최대 듣기 시간 */
  maxMs?: number;
};

function mapError(raw: string): SpeechErrorCode {
  if (raw === "no-speech" || raw === "aborted") return "no-speech";
  if (raw === "not-allowed" || raw === "service-not-allowed") return "mic-denied";
  if (raw === "network") return "network";
  if (raw === "audio-capture") return "audio-capture";
  return "failed";
}

/**
 * 한 문장 듣기. 브라우저별 차이를 흡수:
 * - 최종 결과 없이 끝나면 마지막 중간 결과로 채점 (모바일 Chrome)
 * - 브라우저가 스스로 끝내지 않으면 침묵/시간 초과로 직접 종료 (iOS Safari)
 * - stop()에 브라우저가 반응하지 않아도 일정 시간 뒤 강제로 정리
 */
export function listenOnce(
  h: ListenHandlers,
  { delayMs = 0, silenceMs = 1800, noSpeechMs = 7000, maxMs = 12000 }: ListenOptions = {},
): { stop: () => void } {
  const Ctor = getCtor();
  if (!Ctor) {
    h.onError("failed", "unsupported");
    h.onEnd();
    return { stop: () => {} };
  }

  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;

  let started = false;
  let ready = false;
  let ended = false;
  let delivered = false; // onFinal 또는 onError를 이미 보냈는지
  let lastInterim = "";
  let stopReason = "";
  let error: { code: SpeechErrorCode; raw: string } | null = null;

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const setTimer = (name: string, ms: number, fn: () => void) => {
    clearTimer(name);
    timers.set(name, setTimeout(fn, ms));
  };
  const clearTimer = (name: string) => {
    const t = timers.get(name);
    if (t) clearTimeout(t);
    timers.delete(name);
  };
  const clearAll = () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
  };

  /** 결과를 한 번만 전달하고 종료 */
  const finish = () => {
    if (ended) return;
    ended = true;
    clearAll();
    if (!delivered) {
      delivered = true;
      if (lastInterim) h.onFinal([lastInterim]);
      else h.onError(error?.code ?? "no-speech", error?.raw || stopReason || "ended-without-result");
    }
    h.onEnd();
  };

  /** 인식 종료 요청. 브라우저가 1.5초 안에 끝내지 않으면 강제 정리 */
  const requestStop = (reason: string) => {
    if (ended) return;
    stopReason = stopReason || reason;
    if (!started) return finish();
    try {
      rec.stop();
    } catch {
      /* 이미 멈춤 */
    }
    setTimer("force", 1500, () => {
      try {
        rec.abort();
      } catch {
        /* 무시 */
      }
      finish();
    });
  };

  const markReady = () => {
    if (ready) return;
    ready = true;
    h.onReady();
    setTimer("noSpeech", noSpeechMs, () => requestStop("no-speech-timeout"));
  };

  rec.onstart = markReady;
  rec.onaudiostart = markReady;

  rec.onresult = (e) => {
    markReady();
    clearTimer("noSpeech");
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) {
        if (!delivered) {
          delivered = true;
          const candidates: string[] = [];
          for (let k = 0; k < r.length; k++) candidates.push(r[k].transcript.trim());
          h.onFinal(candidates);
        }
        // 최종 결과를 받았는데 브라우저가 계속 듣고 있으면 직접 종료
        requestStop("final");
        return;
      }
      interim += r[0].transcript;
    }
    if (interim.trim()) {
      lastInterim = interim.trim();
      h.onInterim(lastInterim);
      // 말이 멈추고 조용해지면 종료 (iOS Safari 대응)
      setTimer("silence", silenceMs, () => requestStop("silence"));
    }
  };

  // 오류는 바로 알리지 않고 종료 시점에 정리 (중간 결과가 있으면 그걸로 채점)
  rec.onerror = (e) => {
    error = { code: mapError(e.error), raw: e.error };
  };
  rec.onend = finish;

  // 이전 인식이 아직 정리 중이면 start()가 실패할 수 있어 한 번 재시도
  const begin = (attempt: number) => {
    if (ended) return;
    try {
      rec.start();
      started = true;
      setTimer("max", maxMs, () => requestStop("max-time"));
    } catch (err) {
      if (attempt === 0) {
        setTimer("retry", 300, () => begin(1));
      } else {
        error = { code: "failed", raw: err instanceof Error ? err.name : "start-failed" };
        finish();
      }
    }
  };

  if (delayMs > 0) setTimer("delay", delayMs, () => begin(0));
  else begin(0);

  return { stop: () => requestStop("user-stop") };
}
