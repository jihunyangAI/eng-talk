import { ChapterBrowser } from "@/components/ChapterBrowser";
import { getChapterList } from "@/lib/content";

export default function HomePage() {
  return <ChapterBrowser chapters={getChapterList()} />;
}
