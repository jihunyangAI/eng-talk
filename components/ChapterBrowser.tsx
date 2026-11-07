"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Level } from "@/content/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/categories";
import type { ChapterListItem } from "@/lib/content";
import { CategoryIcon, CloseIcon, SearchIcon, SupansaAvatar } from "./icons";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "./SettingsProvider";

type CatFilter = Category | "all";
type LevelFilter = Level | "all";

const ALL_COLORS = { soft: "var(--all-soft)", strong: "var(--all-strong)" };
const colorsOf = (c: CatFilter) => (c === "all" ? ALL_COLORS : CATEGORY_COLORS[c]);

function readUrl(): { cat: CatFilter; level: LevelFilter; q: string } {
  const p = new URLSearchParams(window.location.search);
  const c = p.get("c");
  const lv = p.get("lv");
  return {
    cat: c && (CATEGORIES as readonly string[]).includes(c) ? (c as Category) : "all",
    level: lv === "beginner" || lv === "intermediate" || lv === "advanced" ? lv : "all",
    q: p.get("q") ?? "",
  };
}

export function ChapterBrowser({ chapters }: { chapters: ChapterListItem[] }) {
  const { lang, t } = useSettings();
  const h = t.home;
  const [cat, setCat] = useState<CatFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [q, setQ] = useState("");
  const tabRefs = useRef(new Map<CatFilter, HTMLButtonElement>());
  const ready = useRef(false);

  // URL(?c=travel&lv=beginner&q=…)에서 필터 복원 — 챕터를 보고 뒤로 와도 그대로
  useEffect(() => {
    const s = readUrl();
    setCat(s.cat);
    setLevel(s.level);
    setQ(s.q);
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const url = new URL(window.location.href);
    const set = (k: string, v: string, def: string) => (v === def ? url.searchParams.delete(k) : url.searchParams.set(k, v));
    set("c", cat, "all");
    set("lv", level, "all");
    set("q", q.trim(), "");
    window.history.replaceState(null, "", url);
  }, [cat, level, q]);

  useEffect(() => {
    tabRefs.current.get(cat)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [cat]);

  const levels = useMemo(() => [...new Set(chapters.map((c) => c.level))] as Level[], [chapters]);

  // 검색·난이도 조건을 통과한 챕터 (탭별 개수 계산용)
  const matched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return chapters.filter((c) => {
      if (level !== "all" && c.level !== level) return false;
      if (!needle) return true;
      const hay = [c.title.en, c.title.ko, c.title.th, c.description.en, c.description.ko, c.description.th]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [chapters, level, q]);

  const visible = cat === "all" ? matched : matched.filter((c) => c.category === cat);
  const countOf = (c: CatFilter) => (c === "all" ? matched.length : matched.filter((m) => m.category === c).length);
  const tabs: CatFilter[] = ["all", ...CATEGORIES];
  const isFiltered = cat !== "all" || level !== "all" || q.trim() !== "";

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <header className="flex items-center justify-between gap-3 px-4 pt-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-14 w-11 shrink-0 items-end justify-center">
            <span aria-hidden className="absolute left-0 top-1 h-11 w-11 rounded-full bg-[var(--accent-soft)]" />
            <SupansaAvatar className="relative h-14 w-10" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[1.125rem] font-semibold tracking-tight text-[var(--ink)]">Supansa&apos;s</span>
            <span className="block text-sm font-medium text-[var(--accent-ink)]">English App</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <LangSwitcher />
        </div>
      </header>

      <section className="px-4 pt-6">
        <h1 className="text-balance text-[1.75rem] font-semibold leading-tight text-[var(--ink)]">{h.greeting}</h1>
        <p className="mt-1.5 text-[var(--muted)]">{t.appSubtitle}</p>
        <label className="relative mt-5 block">
          <span className="sr-only">{h.search}</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={h.search}
            className="h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-12 pr-11 text-[var(--ink)] placeholder:text-[var(--muted)]/80 focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)] [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={h.clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--chip)]"
            >
              <CloseIcon />
            </button>
          )}
        </label>
      </section>

      {/* 카테고리 탭 + 난이도 — 스크롤해도 위에 고정 */}
      <div className="sticky top-0 z-10 mt-5 bg-[var(--bg)]/92 pb-3 pt-1.5 backdrop-blur">
        <div role="tablist" aria-label={h.all} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5 pt-1.5 sm:flex-wrap sm:overflow-visible">
          {tabs.map((c) => {
            const col = colorsOf(c);
            const selected = cat === c;
            const n = countOf(c);
            return (
              <button
                key={c}
                ref={(el) => {
                  if (el) tabRefs.current.set(c, el);
                }}
                role="tab"
                aria-selected={selected}
                onClick={() => setCat(c)}
                style={{ "--c-soft": col.soft, "--c-strong": col.strong } as React.CSSProperties}
                className={`cat flex shrink-0 items-center gap-1.5 rounded-full py-2 pl-2.5 pr-3.5 text-[0.9375rem] font-medium transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-1 active:translate-y-0 active:duration-75 ${
                  selected
                    ? "bg-[var(--c-strong)] text-white shadow-[0_6px_16px_-8px_var(--c-strong)] hover:shadow-[0_12px_22px_-8px_var(--c-strong)]"
                    : "bg-[var(--c-bg)] text-[var(--ink)] hover:shadow-[0_10px_20px_-10px_var(--shadow-tint)]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    selected ? "bg-white/25 text-white" : "bg-[var(--c-icon-bg)] text-[var(--c-icon)]"
                  }`}
                >
                  <CategoryIcon category={c} className="h-4 w-4" />
                </span>
                {c === "all" ? h.all : h.category[c]}
                <span className={`text-sm tabular-nums ${selected ? "text-white/80" : "text-[var(--muted)]"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 px-4">
          <div role="radiogroup" aria-label={h.allLevels} className="flex gap-1.5 text-sm">
            {(["all", ...levels] as LevelFilter[]).map((lv) => (
              <button
                key={lv}
                role="radio"
                aria-checked={level === lv}
                onClick={() => setLevel(lv)}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  level === lv
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {lv === "all" ? h.allLevels : t.level[lv]}
              </button>
            ))}
          </div>
          <span className="shrink-0 text-sm text-[var(--muted)]" aria-live="polite">
            {h.results(visible.length)}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mx-4 mt-6 rounded-3xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center">
          <p className="text-[var(--muted)]">{h.empty}</p>
          {isFiltered && (
            <button
              onClick={() => {
                setCat("all");
                setLevel("all");
                setQ("");
              }}
              className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2 font-medium text-white"
            >
              {h.reset}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          {visible.map((ch, i) => {
            const col = CATEGORY_COLORS[ch.category];
            return (
              <li key={ch.id}>
                <Link
                  href={`/chapters/${ch.id}`}
                  className="group flex items-center gap-3 rounded-[1.25rem] bg-[var(--surface)] p-2.5 pr-3 ring-1 ring-[var(--line)] transition hover:ring-[var(--line-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <div className="relative h-[76px] w-[100px] shrink-0 overflow-hidden rounded-2xl bg-[var(--chip)]">
                    <Image
                      src={ch.cover}
                      alt=""
                      fill
                      sizes="100px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading={i < 6 ? "eager" : "lazy"}
                    />
                    <span
                      className="cat absolute bottom-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--c-bg)] text-[var(--c-icon)] ring-2 ring-[var(--surface)]"
                      style={{ "--c-soft": col.soft, "--c-strong": col.strong } as React.CSSProperties}
                    >
                      <CategoryIcon category={ch.category} className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--ink)]">{ch.title.en}</p>
                    <p className="truncate text-[0.9375rem] text-[var(--muted)]">{ch.title[lang]}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          ch.level === "beginner"
                            ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                            : "bg-[var(--violet-soft)] text-[var(--violet-ink)]"
                        }`}
                      >
                        {t.level[ch.level]}
                      </span>
                      <span className="text-[var(--muted)]">{t.lineCount(ch.lineCount)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
