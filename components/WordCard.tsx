"use client";

import type { Word } from "@/content/types";
import { AudioButton } from "./AudioButton";
import { SpeakButton } from "./SpeakButton";
import { useSettings } from "./SettingsProvider";

/** 현재 장면의 필수 단어 — 단어 · 발음 듣기 · 뜻 */
export function WordCard({ items }: { items: Word[] }) {
  const { lang, t } = useSettings();
  if (items.length === 0) return null;

  return (
    <section aria-label={t.keyWords} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
      <h2 className="text-sm font-semibold text-[var(--accent-ink)]">📝 {t.keyWords}</h2>
      <ul className="mt-2 flex flex-col divide-y divide-[var(--line)]">
        {items.map((w) => (
          <li key={`${w.line}-${w.en}`} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            {w.audio ? <AudioButton src={w.audio} label={t.listen} /> : <SpeakButton text={w.en} label={t.listen} />}
            <span lang="en" className="font-semibold text-[var(--ink)]">
              {w.en}
            </span>
            <span className="ml-auto text-right text-[0.9375rem] leading-snug text-[var(--ink)]/80">{w[lang]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
