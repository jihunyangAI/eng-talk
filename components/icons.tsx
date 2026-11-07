// 작은 선 아이콘 (24×24, currentColor)
import type { Category } from "@/content/types";

type IconProps = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PATHS: Record<Category | "all", React.ReactNode> = {
  all: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  "bar-work": (
    <>
      {/* 칵테일 잔 */}
      <path d="M4.5 5h15L12 13z" />
      <path d="M12 13v6.5" />
      <path d="M8.5 19.5h7" />
      <path d="M15.5 3.5l2 2" />
    </>
  ),
  friends: (
    <>
      {/* 두 친구 */}
      <circle cx="8.5" cy="8.5" r="3" />
      <circle cx="16" cy="9.5" r="2.5" />
      <path d="M3 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 15.2a4.5 4.5 0 0 1 6.5 4.3" />
    </>
  ),
  "hotel-work": (
    <>
      {/* 호텔 프런트 벨 */}
      <path d="M3.5 18h17" />
      <path d="M5 18a7 7 0 0 1 14 0" />
      <path d="M12 11V8.5" />
      <path d="M10 8.5h4" />
    </>
  ),
  "cruise-work": (
    <>
      {/* 크루즈선 */}
      <path d="M3 15h18l-2.2 4.2a1.5 1.5 0 0 1-1.3.8H6.5a1.5 1.5 0 0 1-1.3-.8z" />
      <path d="M6 15v-4h12v4" />
      <path d="M9 11V7.5h6V11" />
      <path d="M12 7.5V4" />
    </>
  ),
  travel: <path d="M10.5 3.5a1.5 1.5 0 0 1 3 0V9l7 4v2l-7-2v4.5l2 1.5v1.5l-3.5-1-3.5 1V19l2-1.5V13l-7 2v-2l7-4z" />,
  stay: (
    <>
      <path d="M3 18V7" />
      <path d="M3 14h18v4" />
      <path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </>
  ),
  food: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
    </>
  ),
  shopping: (
    <>
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
  daily: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  people: (
    <>
      <path d="M4 17.5V7a2.5 2.5 0 0 1 2.5-2.5h8A2.5 2.5 0 0 1 17 7v5a2.5 2.5 0 0 1-2.5 2.5H8z" />
      <path d="M17 9h.5A2.5 2.5 0 0 1 20 11.5V20l-3-2.5h-5a2 2 0 0 1-2-2" />
    </>
  ),
};

export function CategoryIcon({ category, className = "h-4 w-4" }: IconProps & { category: Category | "all" }) {
  return (
    <svg {...base} className={className}>
      {PATHS[category]}
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Supansa 아바타: 20살 여성, 흰 티셔츠 + 긴 청치마 */
export function SupansaAvatar({ className = "h-12 w-9" }: IconProps) {
  return (
    <svg viewBox="0 0 40 56" className={className} role="img" aria-label="Supansa">
      {/* 뒷머리 (긴 생머리) */}
      <path d="M11.5 12.5c0-6 3.8-9.5 8.5-9.5s8.5 3.5 8.5 9.5v11.5c0 1.6-1.3 2.6-2.8 2.2L20 25l-5.7 1.2c-1.5.4-2.8-.6-2.8-2.2z" fill="#3b2a2c" />
      {/* 얼굴 */}
      <ellipse cx="20" cy="13" rx="6.2" ry="6.8" fill="#f7d6bf" />
      {/* 앞머리 */}
      <path d="M13.6 12.4c.4-4.3 3-6.9 6.4-6.9 3.6 0 6.1 2.6 6.5 6.6-2.4-.6-4.6-2-5.9-3.9-1.5 2.2-4 3.6-7 4.2z" fill="#3b2a2c" />
      {/* 볼터치 · 눈 · 미소 */}
      <circle cx="16.4" cy="15.4" r="1.3" fill="#ffb3c7" opacity=".8" />
      <circle cx="23.6" cy="15.4" r="1.3" fill="#ffb3c7" opacity=".8" />
      <circle cx="17.6" cy="13.2" r=".8" fill="#2e2440" />
      <circle cx="22.4" cy="13.2" r=".8" fill="#2e2440" />
      <path d="M18.4 16.6c1 .8 2.2.8 3.2 0" stroke="#d93a6e" strokeWidth=".9" fill="none" strokeLinecap="round" />
      {/* 목 · 팔 */}
      <rect x="18.6" y="19" width="2.8" height="2.6" fill="#f7d6bf" />
      <path d="M12.6 22.5 10 31.5" stroke="#f7d6bf" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M27.4 22.5 30 31.5" stroke="#f7d6bf" strokeWidth="2.6" strokeLinecap="round" />
      {/* 흰 티셔츠 (짧은 소매) */}
      <path d="M14.5 21h11l3.2 3.6-2.3 1.8-1.2-1.2V31h-10.4v-5.8l-1.2 1.2-2.3-1.8z" fill="#ffffff" stroke="#f1d3df" strokeWidth=".6" />
      {/* 긴 청치마 (A라인, 발목까지) */}
      <path d="M14.8 30.6h10.4l4.6 19.6H10.2z" fill="#5b8dc9" />
      <path d="M14.8 30.6h10.4v1.8H14.8z" fill="#4a79b3" />
      <path d="M20 32.4v17.8" stroke="#8db3e2" strokeWidth=".7" strokeDasharray="1.4 1" />
      <path d="M10.8 48.6h18.4" stroke="#8db3e2" strokeWidth=".7" strokeDasharray="1.4 1" />
      {/* 신발 */}
      <ellipse cx="16.6" cy="51.6" rx="2.6" ry="1.4" fill="#2e2440" />
      <ellipse cx="23.4" cy="51.6" rx="2.6" ry="1.4" fill="#2e2440" />
    </svg>
  );
}

/** 로고: 말풍선 두 개 */
export function LogoMark({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect x="2" y="4" width="26" height="20" rx="10" fill="#FF5C8A" />
      <path d="M9 22l-3 7 8-5z" fill="#FF5C8A" />
      <rect x="14" y="14" width="24" height="18" rx="9" fill="#8B7CF6" />
      <path d="M32 30l3 6-8-4z" fill="#8B7CF6" />
      <circle cx="21" cy="23" r="1.8" fill="#fff" />
      <circle cx="26" cy="23" r="1.8" fill="#fff" />
      <circle cx="31" cy="23" r="1.8" fill="#fff" />
    </svg>
  );
}
