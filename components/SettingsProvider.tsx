"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { TranslationLang } from "@/content/types";
import { messages, type TranslationMode } from "@/lib/i18n";

const STORAGE_KEY = "eng-talk:settings";

type Settings = { lang: TranslationLang; mode: TranslationMode };
type SettingsContextValue = Settings & {
  t: (typeof messages)[TranslationLang];
  setLang: (lang: TranslationLang) => void;
  setMode: (mode: TranslationMode) => void;
};

const DEFAULTS: Settings = { lang: "ko", mode: "show" };
const SettingsContext = createContext<SettingsContextValue | null>(null);

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      lang: parsed.lang === "th" ? "th" : "ko",
      mode: parsed.mode === "hide" || parsed.mode === "tap" ? parsed.mode : "show",
    };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  // 정적 HTML은 기본값(ko)으로 렌더링되고, 마운트 후 저장된 설정으로 교체
  useEffect(() => setSettings(load()), []);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 저장 실패(사생활 모드 등)는 무시 — 이번 세션 동안만 유지
      }
      return next;
    });
  }, []);

  const value: SettingsContextValue = {
    ...settings,
    t: messages[settings.lang],
    setLang: (lang) => update({ lang }),
    setMode: (mode) => update({ mode }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
