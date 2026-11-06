import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DialogueViewer } from "@/components/DialogueViewer";
import { getChapter, getChapterIds } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

// 모든 챕터를 빌드 시 정적 생성, 목록에 없는 id는 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getChapterIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = getChapter((await params).id);
  return chapter ? { title: `${chapter.title.en} — Eng Talk` } : {};
}

export default async function ChapterPage({ params }: Props) {
  const chapter = getChapter((await params).id);
  if (!chapter) notFound();
  return <DialogueViewer chapter={chapter} />;
}
