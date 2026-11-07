// 콘텐츠 검증: 구조, speaker/scene 참조 무결성, index.json 동기화, 이미지 존재 여부
// 사용법: node scripts/validate-content.mjs [--skip-images]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipImages = process.argv.includes("--skip-images");
const LANGS = ["en", "ko", "th"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["bar-work", "friends", "hotel-work", "cruise-work", "travel", "stay", "food", "shopping", "daily", "people"];
const IMAGE_RE = /^\/images\/.+\.(webp|png|jpg|jpeg)$/;

const errors = [];
const warnings = [];

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const checkLocalized = (obj, where) => {
  if (!obj || typeof obj !== "object") return errors.push(`${where}: missing`);
  for (const l of LANGS) if (!nonEmpty(obj[l])) errors.push(`${where}.${l}: empty`);
};
const checkImage = (path, where) => {
  if (!IMAGE_RE.test(path ?? "")) return errors.push(`${where}: invalid image path "${path}"`);
  if (!skipImages && !existsSync(join(root, "public", path))) warnings.push(`${where}: image not found ${path}`);
};

function validateChapter(ch, file) {
  const at = (s) => `${file}${s}`;
  if (`${ch.id}.json` !== file) errors.push(at(`: id "${ch.id}" does not match file name`));
  if (!Number.isInteger(ch.order) || ch.order < 1) errors.push(at(".order: must be integer >= 1"));
  if (!LEVELS.includes(ch.level)) errors.push(at(`.level: invalid "${ch.level}"`));
  if (!CATEGORIES.includes(ch.category)) errors.push(at(`.category: invalid "${ch.category}"`));
  checkLocalized(ch.title, at(".title"));
  checkLocalized(ch.description, at(".description"));
  checkImage(ch.cover, at(".cover"));

  const d = ch.dialogue ?? {};
  const speakers = d.speakers ?? [];
  const lines = d.lines ?? [];
  const scenes = d.scenes ?? [];
  if (speakers.length < 2) errors.push(at(".dialogue.speakers: need at least 2"));

  const speakerIds = new Set();
  for (const s of speakers) {
    if (speakerIds.has(s.id)) errors.push(at(`: duplicate speaker id ${s.id}`));
    speakerIds.add(s.id);
    if (!nonEmpty(s.name) || !nonEmpty(s.look)) errors.push(at(`: speaker ${s.id} needs name and look`));
    checkLocalized(s.role, at(`: speaker ${s.id}.role`));
  }

  const lineIds = new Set();
  lines.forEach((l, i) => {
    if (lineIds.has(l.id)) errors.push(at(`: duplicate line id ${l.id}`));
    lineIds.add(l.id);
    if (!speakerIds.has(l.speaker)) errors.push(at(`: line ${l.id} unknown speaker "${l.speaker}"`));
    for (const lang of LANGS) if (!nonEmpty(l[lang])) errors.push(at(`: line ${l.id}.${lang} empty`));
    if (l.audio === undefined) warnings.push(at(`: line ${l.id} has no audio`));
    else {
      if (!/^\/audio\/.+\.mp3$/.test(l.audio)) errors.push(at(`: line ${l.id}.audio invalid path "${l.audio}"`));
      else if (!existsSync(join(root, "public", l.audio))) errors.push(at(`: line ${l.id}.audio file not found ${l.audio}`));
    }
    if (i > 0 && lines[i - 1].speaker === l.speaker) warnings.push(at(`: line ${l.id} same speaker as previous line`));
  });

  // 모든 대사가 정확히 하나의 scene에 순서대로 속해야 함
  const flattened = scenes.flatMap((s) => s.lines ?? []);
  const expected = lines.map((l) => l.id);
  if (flattened.join(",") !== expected.join(",")) {
    errors.push(at(`: scenes must cover lines in order exactly once\n    scenes: [${flattened}]\n    lines:  [${expected}]`));
  }
  const expectedScenes = Math.ceil(lines.length / 2);
  if (scenes.length !== expectedScenes) errors.push(at(`: ${scenes.length} scenes, expected ${expectedScenes} (one per exchange)`));

  const sceneIds = new Set();
  for (const s of scenes) {
    if (sceneIds.has(s.id)) errors.push(at(`: duplicate scene id ${s.id}`));
    sceneIds.add(s.id);
    if (!Array.isArray(s.lines) || s.lines.length < 1 || s.lines.length > 2) errors.push(at(`: scene ${s.id} must have 1-2 lines`));
    if (!nonEmpty(s.prompt)) errors.push(at(`: scene ${s.id} prompt empty`));
    checkImage(s.image, at(`: scene ${s.id}.image`));
  }

  // 핵심 표현: 연결된 대사가 있어야 하고, 표현이 대사 안에 실제로 등장해야 함
  if (ch.expressions !== undefined) {
    if (!Array.isArray(ch.expressions)) errors.push(at(".expressions: must be an array"));
    else
      ch.expressions.forEach((x, i) => {
        const line = lines.find((l) => l.id === x.line);
        if (!line) return errors.push(at(`.expressions[${i}]: unknown line "${x.line}"`));
        for (const k of LANGS) if (!nonEmpty(x[k])) errors.push(at(`.expressions[${i}].${k}: empty`));
        const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
        if (nonEmpty(x.en) && !norm(line.en).includes(norm(x.en)))
          warnings.push(at(`.expressions[${i}]: "${x.en}" not found in ${x.line}`));
      });
  }
  // 필수 단어: 연결된 대사가 있어야 하고, 단어가 대사 안에 등장해야 함 (단어 시작 기준 → booked 안의 book 허용)
  if (ch.words !== undefined) {
    if (!Array.isArray(ch.words)) errors.push(at(".words: must be an array"));
    else {
      const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
      const seen = new Set();
      ch.words.forEach((w, i) => {
        const line = lines.find((l) => l.id === w.line);
        if (!line) return errors.push(at(`.words[${i}]: unknown line "${w.line}"`));
        for (const k of LANGS) if (!nonEmpty(w[k])) errors.push(at(`.words[${i}].${k}: empty`));
        if (nonEmpty(w.en) && !` ${norm(line.en)} `.includes(` ${norm(w.en)}`))
          warnings.push(at(`.words[${i}]: "${w.en}" not found in ${w.line}`));
        const key = norm(w.en ?? "");
        if (seen.has(key)) warnings.push(at(`.words[${i}]: duplicate word "${w.en}"`));
        seen.add(key);
        if (w.audio !== undefined && !existsSync(join(root, "public", w.audio)))
          errors.push(at(`.words[${i}].audio file not found ${w.audio}`));
      });
    }
  }
  return { lines: lines.length, scenes: scenes.length };
}

const chaptersDir = join(root, "content", "chapters");
const files = readdirSync(chaptersDir).filter((f) => f.endsWith(".json")).sort();
const chapters = new Map();
for (const file of files) {
  let ch;
  try {
    ch = JSON.parse(readFileSync(join(chaptersDir, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  const stats = validateChapter(ch, file);
  chapters.set(ch.id, ch);
  console.log(`  ${file}: ${stats.lines} lines, ${stats.scenes} scenes`);
}

// index.json 동기화 확인
const index = JSON.parse(readFileSync(join(root, "content", "index.json"), "utf8"));
const indexIds = new Set(index.map((e) => e.id));
for (const e of index) {
  const ch = chapters.get(e.id);
  if (!ch) { errors.push(`index.json: "${e.id}" has no chapter file`); continue; }
  for (const k of ["order", "level", "category", "cover"]) if (e[k] !== ch[k]) errors.push(`index.json: "${e.id}".${k} differs from chapter`);
  if (JSON.stringify(e.title) !== JSON.stringify(ch.title)) errors.push(`index.json: "${e.id}".title differs from chapter`);
}
for (const id of chapters.keys()) if (!indexIds.has(id)) errors.push(`index.json: missing chapter "${id}"`);
const orders = index.map((e) => e.order);
if (new Set(orders).size !== orders.length) errors.push("index.json: duplicate order values");

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\n${chapters.size} chapters, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
