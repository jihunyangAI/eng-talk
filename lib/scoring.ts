// 발음 정확도 채점 — 인식된 문장을 정답 문장과 단어 단위로 비교
// (채점 방식을 전문 발음평가 API로 바꿀 때는 이 파일만 교체)

export type WordStatus = "ok" | "close" | "miss";
export type ScoredWord = { text: string; status: WordStatus };
export type ScoreResult = { score: number; transcript: string; words: ScoredWord[] };

const SMALL = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberToWords(n: number): string[] {
  if (n < 20) return [SMALL[n]];
  if (n < 100) return n % 10 === 0 ? [TENS[Math.floor(n / 10)]] : [TENS[Math.floor(n / 10)], SMALL[n % 10]];
  return String(n).split("").map((d) => SMALL[Number(d)]);
}

// 축약형은 양쪽 모두 풀어서 비교 ("I'm" == "I am")
const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am", "i'd": "i would", "i'll": "i will", "i've": "i have",
  "you're": "you are", "you'll": "you will", "you've": "you have",
  "he's": "he is", "she's": "she is", "it's": "it is", "that's": "that is",
  "there's": "there is", "here's": "here is", "what's": "what is", "where's": "where is",
  "who's": "who is", "how's": "how is", "that'll": "that will", "let's": "let us",
  "we're": "we are", "we'll": "we will", "they're": "they are",
  "don't": "do not", "doesn't": "does not", "didn't": "did not", "isn't": "is not",
  "can't": "can not", "cannot": "can not", "won't": "will not", "ok": "okay",
};

/** 문장 → 비교용 토큰. owner[i] = 그 토큰이 나온 원래 단어 번호 */
function tokenize(text: string): { tokens: string[]; owner: number[]; display: string[] } {
  const display = text.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  const owner: number[] = [];
  display.forEach((word, i) => {
    const cleaned = word
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/(\d+)[:.](\d+)/g, "$1 $2")
      .replace(/[^a-z0-9' ]+/g, " ");
    for (const raw of cleaned.split(/\s+/)) {
      const t = raw.replace(/^'+|'+$/g, "");
      if (!t) continue;
      const expanded = CONTRACTIONS[t] ?? t;
      for (const part of expanded.split(" ")) {
        const words = /^\d+$/.test(part) ? numberToWords(Number(part)) : [part];
        for (const w of words) {
          tokens.push(w);
          owner.push(i);
        }
      }
    }
  });
  return { tokens, owner, display };
}

function charSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

/** 정답 문장(target)과 인식된 문장(spoken)을 비교해 0~100점과 단어별 결과 반환 */
export function scoreSentence(target: string, spoken: string): ScoreResult {
  const t = tokenize(target);
  const s = tokenize(spoken).tokens;
  const m = t.tokens.length, n = s.length;

  // 단어 단위 편집거리 (치환 비용 = 1 - 철자 유사도)
  const cost = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) cost[i][0] = i;
  for (let j = 1; j <= n; j++) cost[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      cost[i][j] = Math.min(
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
        cost[i - 1][j - 1] + (1 - charSimilarity(t.tokens[i - 1], s[j - 1])),
      );

  // 역추적: 정답 토큰마다 점수(credit) 부여
  const credit = Array<number>(m).fill(0);
  let extra = 0;
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = charSimilarity(t.tokens[i - 1], s[j - 1]);
      if (Math.abs(cost[i][j] - (cost[i - 1][j - 1] + 1 - sim)) < 1e-9) {
        // 정확히 맞으면 1점, 비슷한 단어(철자 60% 이상 일치)는 0.5점, 그 외 0점
        credit[i - 1] = sim === 1 ? 1 : sim >= 0.6 ? 0.5 : 0;
        i--; j--;
        continue;
      }
    }
    if (i > 0 && Math.abs(cost[i][j] - (cost[i - 1][j] + 1)) < 1e-9) { i--; continue; }
    extra++; j--;
  }

  const earned = credit.reduce((a, b) => a + b, 0);
  const score = m === 0 ? 0 : Math.round(Math.max(0, Math.min(1, earned / (m + extra * 0.5))) * 100);

  // 원래 단어 단위로 상태 합치기 (가장 나쁜 상태 기준)
  const rank: Record<WordStatus, number> = { ok: 0, close: 1, miss: 2 };
  const status: WordStatus[] = t.display.map(() => "ok");
  t.owner.forEach((w, k) => {
    const st: WordStatus = credit[k] === 1 ? "ok" : credit[k] >= 0.5 ? "close" : "miss";
    if (rank[st] > rank[status[w]]) status[w] = st;
  });

  return { score, transcript: spoken, words: t.display.map((text, k) => ({ text, status: status[k] })) };
}

/** 인식 후보 여러 개 중 가장 점수가 높은 것을 고름 */
export function scoreBest(target: string, candidates: string[]): ScoreResult {
  return candidates
    .filter((c) => c.trim())
    .map((c) => scoreSentence(target, c))
    .reduce<ScoreResult | null>((best, r) => (!best || r.score > best.score ? r : best), null) ?? {
    score: 0,
    transcript: "",
    words: scoreSentence(target, "").words,
  };
}
