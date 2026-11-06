"use client";

import type { TranslationLang } from "@/content/types";
import { LANG_LABEL } from "@/lib/i18n";
import { useSettings } from "./SettingsProvider";

const LANGS: TranslationLang[] = ["ko", "th"];

export function LangSwitcher() {
  const { lang, setLang } = useSettings();
  return (
    <div
      role="radiogroup"
      aria-label="Translation language"
      className="flex shrink-0 rounded-full bg-[var(--chip)] p-0.5 text-sm"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 font-medium leading-6 transition-colors ${
            lang === l ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm" : "text-[var(--muted)]"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
