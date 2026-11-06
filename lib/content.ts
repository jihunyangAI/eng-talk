// 빌드 시점에 content/ JSON을 읽는 서버 전용 로더
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Chapter, ChapterSummary } from "@/content/types";
import index from "@/content/index.json";

const chaptersDir = join(process.cwd(), "content", "chapters");

export type ChapterListItem = ChapterSummary & {
  description: Chapter["description"];
  lineCount: number;
  sceneCount: number;
};

export function getChapterIds(): string[] {
  return (index as ChapterSummary[]).map((c) => c.id);
}

export function getChapter(id: string): Chapter | null {
  if (!getChapterIds().includes(id)) return null;
  return JSON.parse(readFileSync(join(chaptersDir, `${id}.json`), "utf8")) as Chapter;
}

export function getChapterList(): ChapterListItem[] {
  return [...(index as ChapterSummary[])]
    .sort((a, b) => a.order - b.order)
    .map((summary) => {
      const ch = getChapter(summary.id)!;
      return {
        ...summary,
        description: ch.description,
        lineCount: ch.dialogue.lines.length,
        sceneCount: ch.dialogue.scenes.length,
      };
    });
}
