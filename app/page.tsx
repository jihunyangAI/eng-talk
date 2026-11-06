import { ChapterGrid } from "@/components/ChapterGrid";
import { HomeHeader } from "@/components/HomeHeader";
import { getChapterList } from "@/lib/content";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <HomeHeader />
      <ChapterGrid chapters={getChapterList()} />
    </main>
  );
}
