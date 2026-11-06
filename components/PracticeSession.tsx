"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter, Line } from "@/content/types";
import { scoreBest, type ScoreResult, type WordStatus } from "@/lib/scoring";
import { getSpeechSupport, listenOnce, type SpeechErrorCode, type SpeechSupport } from "@/lib/speech";
import { AudioButton } from "./AudioButton";
import { LangSwitcher } from "./LangSwitcher";
import { useSettings } from "./SettingsProvider";

const HINT_KEY = "eng-talk:practice-hint";

const WORD_CLASS: Record<WordStatus, string> = {
  ok: "text-[var(--ok)]",
  close: "text-[var(--close)] underline decoration-dotted underline-offset-4",
  miss: "text-[var(--miss)] underline decoration-wavy underline-offset-4",
};

function scoreColor(score: number) {
  return score >= 80 ? "var(--ok)" : score >= 50 ? "var(--close)" : "var(--miss)";
}

export function PracticeSession({ chapter }: { chapter: Chapter }) {
  const { lang, t } = useSettings();
  const p = t.practice;
  const { speakers, lines, scenes } = chapter.dialogue;

  const [role, setRole] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<Record<string, ScoreResult>>({});
  const [last, setLast] = useState<ScoreResult | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<SpeechErrorCode | null>(null);
  const [support, setSupport] = useState<SpeechSupport>("ok");
  const [showHint, setShowHint] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [partnerBlocked, setPartnerBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const speakerById = useMemo(() => new Map(speakers.map((s) => [s.id, s])), [speakers]);
  const sceneByLine = useMemo(() => {
    const m = new Map<string, (typeof scenes)[number]>();
    for (const s of scenes) for (const id of s.lines) m.set(id, s);
    return m;
  }, [scenes]);

  const line: Line = lines[step];
  const scene = sceneByLine.get(line.id)!;
  const isMine = role !== null && line.speaker === role;
  const leftId = speakers[0].id;

  useEffect(() => {
    setSupport(getSpeechSupport());
    try {
      if (localStorage.getItem(HINT_KEY) === "hide") setShowHint(false);
    } catch {}
  }, []);

  const toggleHint = () => {
    setShowHint((v) => {
      try {
        localStorage.setItem(HINT_KEY, v ? "hide" : "show");
      } catch {}
      return !v;
    });
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
  };

  const advance = useCallback(() => {
    stopAudio();
    recRef.current?.stop();
    setLast(null);
    setInterim("");
    setError(null);
    setRevealed(false);
    setPartnerBlocked(false);
    if (step >= lines.length - 1) setDone(true);
    else setStep(step + 1);
  }, [step, lines.length]);

  // 상대방 차례: 음성 자동 재생 후 다음 대사로
  const playPartner = useCallback(() => {
    if (!line.audio) return;
    stopAudio();
    const a = new Audio(line.audio);
    audioRef.current = a;
    let timer: ReturnType<typeof setTimeout>;
    a.addEventListener("ended", () => {
      timer = setTimeout(() => {
        if (audioRef.current === a) advance();
      }, 600);
    });
    a.play().then(
      () => setPartnerBlocked(false),
      () => setPartnerBlocked(true),
    );
    return () => clearTimeout(timer);
  }, [line.audio, advance]);

  useEffect(() => {
    if (role === null || done || isMine) return;
    if (!line.audio) {
      setPartnerBlocked(true);
      return;
    }
    const cleanup = playPartner();
    return () => {
      cleanup?.();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, step, done]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, last, listening, interim]);

  useEffect(() => () => {
    stopAudio();
    recRef.current?.stop();
  }, []);

  const startListening = () => {
    stopAudio();
    setError(null);
    setInterim("");
    setLast(null);
    setListening(true);
    recRef.current = listenOnce({
      onInterim: setInterim,
      onFinal: (candidates) => {
        const result = scoreBest(line.en, candidates);
        setLast(result);
        setBest((b) => (!b[line.id] || result.score > b[line.id].score ? { ...b, [line.id]: result } : b));
      },
      onError: setError,
      onEnd: () => {
        setListening(false);
        recRef.current = null;
      },
    });
  };

  const start = (speakerId: string) => {
    setRole(speakerId);
    setStep(0);
    setDone(false);
    setBest({});
    setLast(null);
    setError(null);
  };

  const header = (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
      <Link href={`/chapters/${chapter.id}`} className="shrink-0 text-sm font-medium text-[var(--accent)]">
        ← {p.backToDialogue}
      </Link>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate font-semibold text-[var(--ink)]">{p.title}</p>
        <p className="truncate text-xs text-[var(--muted)]">{chapter.title.en}</p>
      </div>
      <LangSwitcher />
    </header>
  );

  // ── 1. 역할 선택 ──
  if (role === null) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        {header}
        <main className="flex-1 px-4 py-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">{p.chooseRole}</h1>
          <p className="mt-1 text-[var(--muted)]">{p.chooseRoleDesc}</p>
          {support !== "ok" && <Notice>{p.errors[support]}</Notice>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {speakers.map((s) => {
              const count = lines.filter((l) => l.speaker === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => start(s.id)}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <p className="text-lg font-semibold text-[var(--ink)]">{s.role[lang]}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {s.name} · {t.lineCount(count)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--ink)]" lang="en">
                    “{lines.find((l) => l.speaker === s.id)?.en}”
                  </p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── 3. 결과 ──
  if (done) {
    const mine = lines.filter((l) => l.speaker === role);
    // 건너뛴 문장은 0점으로 계산
    const avg = mine.length ? Math.round(mine.reduce((a, l) => a + (best[l.id]?.score ?? 0), 0) / mine.length) : 0;
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        {header}
        <main className="flex-1 px-4 py-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">{p.resultTitle}</h1>
          <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center">
            <p className="text-sm text-[var(--muted)]">{p.average}</p>
            <p className="mt-1 text-5xl font-bold tabular-nums" style={{ color: scoreColor(avg) }}>
              {avg}%
            </p>
            <p className="mt-1 text-[var(--ink)]">{p.feedback(avg)}</p>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {mine.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p lang="en" className="text-[var(--ink)]">{l.en}</p>
                  {best[l.id] && (
                    <p lang="en" className="mt-0.5 truncate text-sm text-[var(--muted)]">
                      🎤 {best[l.id].transcript}
                    </p>
                  )}
                </div>
                <span
                  className="shrink-0 text-lg font-semibold tabular-nums"
                  style={{ color: best[l.id] ? scoreColor(best[l.id].score) : "var(--muted)" }}
                >
                  {best[l.id] ? `${best[l.id].score}%` : p.notTried}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => start(role)} className="rounded-full bg-[var(--accent)] px-5 py-2.5 font-medium text-white">
              {p.again}
            </button>
            <button onClick={() => setRole(null)} className="rounded-full border border-[var(--line-strong)] px-5 py-2.5 font-medium text-[var(--ink)]">
              {p.switchRole}
            </button>
            <Link href="/" className="rounded-full px-5 py-2.5 font-medium text-[var(--accent)]">
              {t.back}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── 2. 대화 진행 ──
  const sceneIdx = scenes.indexOf(scene);
  const inScene = scene.lines.slice(0, scene.lines.indexOf(line.id) + 1).map((id) => lines.find((l) => l.id === id)!);
  // 장면이 바뀌어도 바로 앞 대사(대답할 질문)는 계속 보여줌
  const prev = step > 0 ? lines[step - 1] : null;
  const visible = prev && !inScene.includes(prev) ? [prev, ...inScene] : inScene;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      {header}
      <main className="flex-1 px-4 pb-6 pt-4">
        <div className="relative aspect-[4/3] max-h-[42dvh] w-full overflow-hidden rounded-2xl bg-[var(--chip)]">
          <Image key={scene.id} src={scene.image} alt={scene.prompt} fill priority sizes="(min-width: 672px) 640px, 100vw" className="object-cover" />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
            {t.sceneOf(sceneIdx + 1, scenes.length)}
          </span>
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
            {p.me}: {speakerById.get(role)!.role[lang]}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[var(--muted)]">
            <input type="checkbox" checked={showHint} onChange={toggleHint} className="h-4 w-4 accent-[var(--accent)]" />
            {p.hint}
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-4">
          {visible.map((l) => {
            const sp = speakerById.get(l.speaker)!;
            const right = l.speaker !== leftId;
            const current = l.id === line.id;
            const mineLine = l.speaker === role;
            const fromPrevScene = !scene.lines.includes(l.id);
            return (
              <div
                key={l.id}
                className={`flex flex-col ${right ? "items-end" : "items-start"} ${fromPrevScene ? "opacity-70" : ""}`}
              >
                <span className="mb-1 px-1 text-xs font-medium text-[var(--muted)]">
                  {mineLine ? `${p.me} · ` : ""}
                  {sp.name} · {sp.role[lang]}
                </span>
                <div
                  className={`w-full max-w-[92%] rounded-2xl px-4 py-3 ${
                    right ? "rounded-tr-md" : "rounded-tl-md"
                  } ${
                    mineLine
                      ? "border-2 border-[var(--accent)] bg-[var(--surface)]"
                      : right
                        ? "bg-[var(--bubble-right)]"
                        : "border border-[var(--line)] bg-[var(--surface)]"
                  }`}
                >
                  {mineLine && current ? (
                    <MyTurn
                      line={l}
                      translation={l[lang]}
                      showHint={showHint || revealed}
                      onReveal={() => setRevealed(true)}
                      listening={listening}
                      interim={interim}
                      result={last}
                      error={error}
                      support={support}
                      onMic={startListening}
                      onStop={() => recRef.current?.stop()}
                      onNext={advance}
                    />
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <p lang="en" className="flex-1 text-[1.0625rem] font-medium leading-snug text-[var(--ink)]">
                          {l.en}
                        </p>
                        {l.audio && !current && <AudioButton src={l.audio} label={t.listen} />}
                        {mineLine && best[l.id] && (
                          <span className="shrink-0 font-semibold tabular-nums" style={{ color: scoreColor(best[l.id].score) }}>
                            {best[l.id].score}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[0.9375rem] leading-snug text-[var(--muted)]">{l[lang]}</p>
                      {current && !mineLine && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          {partnerBlocked ? (
                            <button onClick={playPartner} className="rounded-full bg-[var(--accent)] px-3 py-1.5 font-medium text-white">
                              ▶ {p.replay}
                            </button>
                          ) : (
                            <span className="flex items-center gap-2 text-[var(--muted)]">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                              {p.partnerSpeaking}
                            </span>
                          )}
                          <button onClick={advance} className="ml-auto rounded-full px-3 py-1.5 font-medium text-[var(--accent)]">
                            {t.next} ▶
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </main>

      <div className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--bg)]/90 px-4 py-2 backdrop-blur">
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--chip)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((step + 1) / lines.length) * 100}%` }} />
        </div>
        <p className="mt-1 text-center text-xs text-[var(--muted)] tabular-nums">
          {step + 1} / {lines.length}
        </p>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-3 rounded-xl border border-[var(--miss)]/30 bg-[var(--miss-soft)] px-3 py-2 text-sm text-[var(--miss)]">
      {children}
    </p>
  );
}

type MyTurnProps = {
  line: Line;
  translation: string;
  showHint: boolean;
  onReveal: () => void;
  listening: boolean;
  interim: string;
  result: ScoreResult | null;
  error: SpeechErrorCode | null;
  support: SpeechSupport;
  onMic: () => void;
  onStop: () => void;
  onNext: () => void;
};

function MyTurn(props: MyTurnProps) {
  const { t } = useSettings();
  const p = t.practice;
  const { line, result, listening } = props;

  return (
    <div>
      <p className="text-[0.9375rem] text-[var(--muted)]">{props.translation}</p>

      {/* 정답 문장: 채점 후에는 단어별 색 표시 */}
      <div className="mt-2 flex items-start gap-2">
        {result ? (
          <p lang="en" className="flex-1 text-[1.0625rem] font-medium leading-relaxed">
            {result.words.map((w, i) => (
              <span key={i} className={WORD_CLASS[w.status]}>
                {w.text}{" "}
              </span>
            ))}
          </p>
        ) : props.showHint ? (
          <p lang="en" className="flex-1 text-[1.0625rem] font-medium leading-snug text-[var(--ink)]">
            {line.en}
          </p>
        ) : (
          <button
            onClick={props.onReveal}
            className="flex-1 rounded-md border border-dashed border-[var(--line-strong)] px-2 py-1 text-left text-sm text-[var(--muted)]"
          >
            {p.hintHidden}
          </button>
        )}
        {line.audio && <AudioButton src={line.audio} label={p.listenModel} />}
      </div>

      {result && (
        <div className="mt-3 rounded-xl bg-[var(--chip)] px-3 py-2.5">
          <p className="text-xs text-[var(--muted)]">{p.youSaid}</p>
          <p lang="en" className="text-[var(--ink)]">
            {result.transcript || "—"}
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--muted)]">{p.accuracy}</p>
              <p className="text-3xl font-bold tabular-nums" style={{ color: scoreColor(result.score) }}>
                {result.score}%
              </p>
            </div>
            <p className="pb-1 font-medium text-[var(--ink)]">{p.feedback(result.score)}</p>
          </div>
          <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-[var(--muted)]">
            <span className="text-[var(--ok)]">● {p.legend.ok}</span>
            <span className="text-[var(--close)]">● {p.legend.close}</span>
            <span className="text-[var(--miss)]">● {p.legend.miss}</span>
          </p>
        </div>
      )}

      {listening && (
        <p lang="en" className="mt-3 min-h-6 italic text-[var(--muted)]">
          {props.interim || p.listening}
        </p>
      )}
      {!listening && !result && props.error && <Notice>{p.errors[props.error]}</Notice>}
      {props.support !== "ok" && <Notice>{p.errors[props.support]}</Notice>}

      {!result && !listening && <p className="mt-3 text-sm text-[var(--muted)]">{p.yourTurn}</p>}
      <div className="mt-2 flex items-center gap-2">
        {listening ? (
          <button
            onClick={props.onStop}
            className="flex items-center gap-2 rounded-full bg-[var(--miss)] px-4 py-2 font-medium text-white"
          >
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            {p.stop}
          </button>
        ) : (
          <button
            onClick={props.onMic}
            disabled={props.support !== "ok"}
            className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            {result ? p.tryAgain : p.speak}
          </button>
        )}
        {!listening && (
          <button
            onClick={props.onNext}
            className="ml-auto whitespace-nowrap rounded-full px-3 py-2 font-medium text-[var(--accent)]"
          >
            {result ? `${t.next} ▶` : p.skip}
          </button>
        )}
      </div>
    </div>
  );
}
