"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChapterListItem } from "@/lib/content";
import { useSettings } from "./SettingsProvider";

export function ChapterGrid({ chapters }: { chapters: ChapterListItem[] }) {
  const { lang, t } = useSettings();
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {chapters.map((ch, i) => (
        <li key={ch.id}>
          <Link
            href={`/chapters/${ch.id}`}
            className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <div className="relative aspect-[4/3] bg-[var(--chip)]">
              <Image
                src={ch.cover}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority={i < 2}
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
                {String(ch.order).padStart(2, "0")}
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">{ch.title.en}</h2>
              <p className="text-[var(--muted)]">{ch.title[lang]}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{ch.description[lang]}</p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-medium text-[var(--accent)]">
                  {t.level[ch.level]}
                </span>
                <span className="rounded-full bg-[var(--chip)] px-2 py-0.5 text-[var(--muted)]">
                  {t.sceneCount(ch.sceneCount)} · {t.lineCount(ch.lineCount)}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
