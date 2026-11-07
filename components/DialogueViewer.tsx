"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter } from "@/content/types";
import type { TranslationMode } from "@/lib/i18n";
import { ExpressionCard } from "./ExpressionCard";
import { LangSwitcher } from "./LangSwitcher";
import { LineBubble } from "./LineBubble";
import { useSettings } from "./SettingsProvider";

const MODES: TranslationMode[] = ["show", "tap", "hide"];

function readSceneFromUrl(total: number): number {
  const n = Number(new URLSearchParams(window.location.search).get("s"));
  return Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : 0;
}

export function DialogueViewer({ chapter }: { chapter: Chapter }) {
  const { lang, mode, setMode, t } = useSettings();
  const { speakers, lines, scenes } = chapter.dialogue;
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const lineById = useMemo(() => new Map(lines.map((l) => [l.id, l])), [lines]);
  const speakerById = useMemo(() => new Map(speakers.map((s) => [s.id, s])), [speakers]);
  const leftSpeakerId = speakers[0].id;
  const scene = scenes[index];
  const isLast = index === scenes.length - 1;

  // ?s=3 으로 특정 장면 바로 열기
  useEffect(() => setIndex(readSceneFromUrl(scenes.length)), [scenes.length]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(scenes.length - 1, next));
      setIndex(clamped);
      const url = new URL(window.location.href);
      url.searchParams.set("s", String(clamped + 1));
      window.history.replaceState(null, "", url);
    },
    [scenes.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="shrink-0 text-sm font-medium text-[var(--accent)]">
          ← {t.back}
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-semibold text-[var(--ink)]">{chapter.title.en}</p>
          <p className="truncate text-xs text-[var(--muted)]">{chapter.title[lang]}</p>
        </div>
        <LangSwitcher />
      </header>

      <main className="flex-1 px-4 pb-4 pt-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative aspect-[4/3] max-h-[42dvh] w-full overflow-hidden rounded-2xl bg-[var(--chip)]">
          {scenes.map((s, i) =>
            // 현재 장면과 바로 다음 장면만 마운트 → 넘길 때 즉시 표시
            Math.abs(i - index) <= 1 ? (
              <Image
                key={s.id}
                src={s.image}
                alt={i === index ? s.prompt : ""}
                aria-hidden={i !== index}
                fill
                sizes="(min-width: 672px) 640px, 100vw"
                priority={i === index}
                className={`object-cover transition-opacity duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
              />
            ) : null,
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
            {t.sceneOf(index + 1, scenes.length)}
          </span>
        </div>

        <Link
          href={`/chapters/${chapter.id}/practice`}
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--accent)] px-4 py-3 text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <span>
            <span className="block font-semibold">{t.practice.cta}</span>
            <span className="block text-sm text-white/80">{t.practice.ctaDesc}</span>
          </span>
          <span aria-hidden>▶</span>
        </Link>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t.translation}</span>
          <div role="radiogroup" aria-label={t.translation} className="flex rounded-full bg-[var(--chip)] p-0.5 text-sm">
            {MODES.map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  mode === m ? "bg-[var(--surface)] font-medium text-[var(--ink)] shadow-sm" : "text-[var(--muted)]"
                }`}
              >
                {t.mode[m]}
              </button>
            ))}
          </div>
        </div>

        {/* key로 장면/언어가 바뀌면 '탭해서 보기' 상태 초기화 */}
        <div key={`${scene.id}-${mode}`} className="mt-4 flex flex-col gap-4">
          {scene.lines.map((lineId) => {
            const line = lineById.get(lineId)!;
            return (
              <LineBubble
                key={line.id}
                line={line}
                speaker={speakerById.get(line.speaker)!}
                side={line.speaker === leftSpeakerId ? "left" : "right"}
              />
            );
          })}
          <ExpressionCard items={(chapter.expressions ?? []).filter((x) => scene.lines.includes(x.line))} />
        </div>
      </main>

      <nav className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-30"
          >
            ◀ {t.prev}
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {scenes.map((s, i) => (
              <button
                key={s.id}
                tabIndex={-1}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-5 bg-[var(--accent)]" : "w-2 bg-[var(--line-strong)]"
                }`}
              />
            ))}
          </div>
          {isLast ? (
            <Link href="/" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
              {t.finish}
            </Link>
          ) : (
            <button
              onClick={() => go(index + 1)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              {t.next} ▶
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
