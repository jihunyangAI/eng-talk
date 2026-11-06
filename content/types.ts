// 콘텐츠 데이터 타입 — Next.js 앱에서 그대로 import 해서 사용

export type Lang = "en" | "ko" | "th";
export type TranslationLang = Exclude<Lang, "en">;
export type Level = "beginner" | "intermediate" | "advanced";

/** 언어별 텍스트 */
export type LocalizedText = Record<Lang, string>;

export interface Speaker {
  /** 대사에서 참조하는 짧은 id (예: "A", "B") */
  id: string;
  /** 영어 이름/호칭 */
  name: string;
  /** 역할 번역 (예: 항공사 직원) */
  role: LocalizedText;
  /** 외모 묘사 — 이미지 생성 시 인물 일관성 유지용 */
  look: string;
  /** 음성 생성용 목소리 — 같은 인물은 항상 같은 목소리 */
  voice?: { name: string; voiceId: string };
}

/** 대사 1줄 = 영어 + 번역(ko/th) 한 세트 */
export interface Line {
  id: string;
  speaker: string; // Speaker.id
  en: string;
  ko: string;
  th: string;
  /** 영어 발음 음성, public/ 기준 경로 (예: /audio/airport-checkin/l1.mp3) */
  audio?: string;
}

/** 두 사람이 한 번씩 주고받을 때마다 1장 */
export interface Scene {
  id: string;
  /** 이 장면에 해당하는 대사 id (보통 2개, 마지막은 1개일 수 있음) */
  lines: string[];
  /** public/ 기준 경로 (예: /images/airport-checkin/s1.webp) */
  image: string;
  /** 이미지 생성 프롬프트 (재생성용) */
  prompt: string;
}

export interface Dialogue {
  speakers: Speaker[];
  lines: Line[];
  scenes: Scene[];
}

export interface Chapter {
  id: string;
  order: number;
  title: LocalizedText;
  description: LocalizedText;
  level: Level;
  cover: string;
  dialogue: Dialogue;
}

/** content/index.json 의 항목 — 챕터 목록 화면용 */
export type ChapterSummary = Pick<Chapter, "id" | "order" | "title" | "level" | "cover">;
