import { CATEGORIES, type Category } from "@/content/types";

/** 카테고리별 스티커 색 — soft: 배경/칩, strong: 아이콘·선택 상태 */
export const CATEGORY_COLORS: Record<Category, { soft: string; strong: string }> = {
  "bar-work": { soft: "#F4E1F7", strong: "#9233A3" },
  friends: { soft: "#FFE6DC", strong: "#C9502E" },
  "hotel-work": { soft: "#D8F2F1", strong: "#0D7A75" },
  "cruise-work": { soft: "#E1E6FF", strong: "#3F4BC4" },
  travel: { soft: "#DDEFFF", strong: "#2C7BD0" },
  stay: { soft: "#ECE6FF", strong: "#6B52D6" },
  food: { soft: "#FFE8D6", strong: "#D9601F" },
  shopping: { soft: "#FFE0EC", strong: "#D63A76" },
  daily: { soft: "#D9F5E8", strong: "#178F63" },
  people: { soft: "#FFF1BF", strong: "#A87600" },
};

export { CATEGORIES };
export type { Category };
