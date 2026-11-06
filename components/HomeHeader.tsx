"use client";

import { LangSwitcher } from "./LangSwitcher";
import { useSettings } from "./SettingsProvider";

export function HomeHeader() {
  const { t } = useSettings();
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">{t.appTitle}</h1>
        <p className="mt-1 text-[var(--muted)]">{t.appSubtitle}</p>
      </div>
      <LangSwitcher />
    </header>
  );
}
