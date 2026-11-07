// 화면 문구 — 선택한 번역 언어(ko/th)를 따라감
import type { Level, TranslationLang } from "@/content/types";

export type TranslationMode = "show" | "hide" | "tap";

type Messages = {
  appTitle: string;
  appSubtitle: string;
  level: Record<Level, string>;
  lineCount: (n: number) => string;
  sceneCount: (n: number) => string;
  back: string;
  prev: string;
  next: string;
  translation: string;
  mode: Record<TranslationMode, string>;
  tapToReveal: string;
  listen: string;
  sceneOf: (i: number, n: number) => string;
  finish: string;
  practice: Practice;
};

type Practice = {
  title: string;
  cta: string;
  ctaDesc: string;
  chooseRole: string;
  chooseRoleDesc: string;
  me: string;
  partnerSpeaking: string;
  yourTurn: string;
  preparing: string;
  speakNow: string;
  speak: string;
  stop: string;
  youSaid: string;
  accuracy: string;
  tryAgain: string;
  hint: string;
  hintHidden: string;
  listenModel: string;
  replay: string;
  skip: string;
  feedback: (score: number) => string;
  errors: {
    "no-speech": string;
    "mic-denied": string;
    network: string;
    "audio-capture": string;
    failed: string;
    unsupported: string;
    insecure: string;
  };
  resultTitle: string;
  average: string;
  notTried: string;
  again: string;
  switchRole: string;
  backToDialogue: string;
  legend: { ok: string; close: string; miss: string };
};

export const LANG_LABEL: Record<TranslationLang, string> = { ko: "한국어", th: "ไทย" };

export const messages: Record<TranslationLang, Messages> = {
  ko: {
    appTitle: "상황별 영어회화",
    appSubtitle: "장면을 보며 실전 대화를 익혀요",
    level: { beginner: "초급", intermediate: "중급", advanced: "고급" },
    lineCount: (n) => `${n}문장`,
    sceneCount: (n) => `장면 ${n}개`,
    back: "목록",
    prev: "이전",
    next: "다음",
    translation: "번역",
    mode: { show: "보기", hide: "숨기기", tap: "탭해서 보기" },
    tapToReveal: "탭해서 번역 보기",
    listen: "발음 듣기",
    sceneOf: (i, n) => `장면 ${i} / ${n}`,
    finish: "완료! 목록으로",
    practice: {
      title: "체험하기",
      cta: "🎤 체험하기",
      ctaDesc: "역할을 골라 직접 말해 보세요",
      chooseRole: "어떤 역할을 할까요?",
      chooseRoleDesc: "상대방이 말하면, 내 차례에 마이크로 영어 문장을 말해요.",
      me: "나",
      partnerSpeaking: "상대방이 말하는 중…",
      yourTurn: "내 차례예요. '말하기'를 누르고 영어로 말해 보세요",
      preparing: "마이크 준비 중… 잠시만요",
      speakNow: "지금 말하세요 · 말을 마치면 자동으로 끝나요",
      speak: "말하기",
      stop: "그만",
      youSaid: "내가 말한 문장",
      accuracy: "발음 정확도",
      tryAgain: "다시 말하기",
      hint: "영어 문장 보기",
      hintHidden: "영어 문장이 숨겨져 있어요 · 탭해서 보기",
      listenModel: "정답 발음 듣기",
      replay: "다시 듣기",
      skip: "건너뛰기",
      feedback: (s) => (s >= 90 ? "완벽해요!" : s >= 70 ? "잘했어요!" : s >= 50 ? "조금만 더!" : "다시 해 볼까요?"),
      errors: {
        "no-speech": "소리가 들리지 않았어요. '지금 말하세요'가 보인 뒤에 또박또박 말해 보세요.",
        network: "인터넷 연결이 불안정해서 인식하지 못했어요. 다시 해 보세요.",
        "audio-capture": "마이크를 쓸 수 없어요. 다른 앱이 마이크를 쓰고 있는지 확인해 주세요.",
        "mic-denied": "마이크 권한이 필요해요. 주소창의 마이크 아이콘에서 허용해 주세요.",
        failed: "음성인식에 실패했어요. 잠시 후 다시 해 보세요.",
        unsupported: "이 브라우저는 음성인식을 지원하지 않아요. Chrome, Edge, Safari에서 열어 주세요.",
        insecure: "마이크는 https 주소나 localhost에서만 쓸 수 있어요.",
      },
      resultTitle: "체험 결과",
      average: "평균 정확도",
      notTried: "건너뜀",
      again: "다시 체험하기",
      switchRole: "역할 바꾸기",
      backToDialogue: "대화 보기로",
      legend: { ok: "정확", close: "비슷", miss: "틀림/빠짐" },
    },
  },
  th: {
    appTitle: "บทสนทนาภาษาอังกฤษตามสถานการณ์",
    appSubtitle: "เรียนบทสนทนาจริงผ่านภาพแต่ละฉาก",
    level: { beginner: "ระดับต้น", intermediate: "ระดับกลาง", advanced: "ระดับสูง" },
    lineCount: (n) => `${n} ประโยค`,
    sceneCount: (n) => `${n} ฉาก`,
    back: "รายการ",
    prev: "ก่อนหน้า",
    next: "ถัดไป",
    translation: "คำแปล",
    mode: { show: "แสดง", hide: "ซ่อน", tap: "แตะเพื่อดู" },
    tapToReveal: "แตะเพื่อดูคำแปล",
    listen: "ฟังการออกเสียง",
    sceneOf: (i, n) => `ฉาก ${i} / ${n}`,
    finish: "เสร็จแล้ว! กลับไปที่รายการ",
    practice: {
      title: "ฝึกสนทนา",
      cta: "🎤 ฝึกสนทนา",
      ctaDesc: "เลือกบทบาทแล้วลองพูดด้วยตัวเอง",
      chooseRole: "คุณอยากเล่นบทไหน",
      chooseRoleDesc: "เมื่ออีกฝ่ายพูดจบ ถึงตาคุณให้พูดประโยคภาษาอังกฤษผ่านไมโครโฟน",
      me: "ฉัน",
      partnerSpeaking: "อีกฝ่ายกำลังพูด…",
      yourTurn: "ถึงตาคุณแล้ว กด 'พูด' แล้วพูดเป็นภาษาอังกฤษ",
      preparing: "กำลังเตรียมไมโครโฟน… รอสักครู่",
      speakNow: "พูดได้เลย · พูดจบแล้วจะหยุดเอง",
      speak: "พูด",
      stop: "หยุด",
      youSaid: "สิ่งที่คุณพูด",
      accuracy: "ความแม่นยำในการออกเสียง",
      tryAgain: "พูดอีกครั้ง",
      hint: "แสดงประโยคภาษาอังกฤษ",
      hintHidden: "ซ่อนประโยคภาษาอังกฤษไว้ · แตะเพื่อดู",
      listenModel: "ฟังเสียงต้นแบบ",
      replay: "ฟังอีกครั้ง",
      skip: "ข้าม",
      feedback: (s) => (s >= 90 ? "ยอดเยี่ยม!" : s >= 70 ? "ดีมาก!" : s >= 50 ? "อีกนิดเดียว!" : "ลองอีกครั้งนะ"),
      errors: {
        "no-speech": "ไม่ได้ยินเสียง ลองพูดชัด ๆ หลังจากขึ้นข้อความ 'พูดได้เลย'",
        network: "การเชื่อมต่ออินเทอร์เน็ตไม่เสถียร ลองอีกครั้ง",
        "audio-capture": "ใช้ไมโครโฟนไม่ได้ ตรวจสอบว่ามีแอปอื่นใช้ไมโครโฟนอยู่หรือไม่",
        "mic-denied": "ต้องอนุญาตให้ใช้ไมโครโฟน กรุณากดอนุญาตที่ไอคอนไมโครโฟนบนแถบที่อยู่",
        failed: "การรู้จำเสียงล้มเหลว กรุณาลองใหม่อีกครั้ง",
        unsupported: "เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง กรุณาเปิดด้วย Chrome, Edge หรือ Safari",
        insecure: "ใช้ไมโครโฟนได้เฉพาะบน https หรือ localhost เท่านั้น",
      },
      resultTitle: "ผลการฝึก",
      average: "ความแม่นยำเฉลี่ย",
      notTried: "ข้ามแล้ว",
      again: "ฝึกอีกครั้ง",
      switchRole: "เปลี่ยนบทบาท",
      backToDialogue: "กลับไปที่บทสนทนา",
      legend: { ok: "ถูกต้อง", close: "ใกล้เคียง", miss: "ผิด/ขาด" },
    },
  },
};
