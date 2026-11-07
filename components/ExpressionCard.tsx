"use client";

import type { Expression } from "@/content/types";
import { useSettings } from "./SettingsProvider";

/** 현재 장면의 대사에 나온 핵심 표현 — 뜻·쓰임과 비슷한 말 */
export function ExpressionCard({ items }: { items: Expression[] }) {
  const { lang, t } = useSettings();
  if (items.length === 0) return null;

  return (
    <section
      aria-label={t.keyExpressions}
      className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--chip)] px-4 py-3"
    >
      <h2 className="text-sm font-semibold text-[var(--accent-ink)]">💡 {t.keyExpressions}</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {items.map((x) => (
          <li key={`${x.line}-${x.en}`}>
            <p lang="en" className="font-semibold text-[var(--ink)]">
              {x.en}
            </p>
            <p className="mt-0.5 text-[0.9375rem] leading-snug text-[var(--ink)]/80">{x[lang]}</p>
            {x.alt && (
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                {t.alsoSay}: <span lang="en">{x.alt}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
