import type { Metadata, Viewport } from "next";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eng Talk — 상황별 영어회화",
  description: "장면 사진과 함께 상황별 영어 대화를 익히는 학습 앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
