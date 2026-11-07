import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import { SettingsProvider } from "@/components/SettingsProvider";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import "./globals.css";

// Prompt: 태국 Cadson Demak의 둥근 글꼴 — 영어·태국어를 한 서체로 (한국어는 시스템 글꼴로 대체)
const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Supansa's English App",
  description: "Supansa가 장면 사진과 함께 상황별 영어 대화를 익히는 학습 앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1624" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={prompt.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
