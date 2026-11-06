"use client";

import { useState } from "react";
import type { Line, Speaker } from "@/content/types";
import { AudioButton } from "./AudioButton";
import { useSettings } from "./SettingsProvider";

type Props = { line: Line; speaker: Speaker; side: "left" | "right" };

export function LineBubble({ line, speaker, side }: Props) {
  const { lang, mode, t } = useSettings();
  const [revealed, setRevealed] = useState(false);
  const right = side === "right";

  return (
    <div className={`flex flex-col ${right ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-xs font-medium text-[var(--muted)]">
        {speaker.name} · {speaker.role[lang]}
      </span>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 ${
          right
            ? "rounded-tr-md bg-[var(--bubble-right)] text-[var(--ink)]"
            : "rounded-tl-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
        }`}
      >
        <div className="flex items-start gap-2">
          <p lang="en" className="flex-1 text-[1.0625rem] leading-snug font-medium">
            {line.en}
          </p>
          {line.audio && <AudioButton src={line.audio} label={t.listen} />}
        </div>
        {mode === "show" && <p className="mt-1.5 text-[0.9375rem] leading-snug text-[var(--muted)]">{line[lang]}</p>}
        {mode === "tap" &&
          (revealed ? (
            <p className="mt-1.5 text-[0.9375rem] leading-snug text-[var(--muted)]">{line[lang]}</p>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-1.5 rounded-md border border-dashed border-[var(--line-strong)] px-2 py-0.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {t.tapToReveal}
            </button>
          ))}
      </div>
    </div>
  );
}
