import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/PracticeSession";
import { getChapter, getChapterIds } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getChapterIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = getChapter((await params).id);
  return chapter ? { title: `Practice: ${chapter.title.en} — Supansa's English App` } : {};
}

export default async function PracticePage({ params }: Props) {
  const chapter = getChapter((await params).id);
  if (!chapter) notFound();
  return <PracticeSession chapter={chapter} />;
}
