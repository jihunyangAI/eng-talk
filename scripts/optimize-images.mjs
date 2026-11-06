// public/images 의 장면 사진 용량 줄이기 (최대 너비 1200px, WebP 품질 80)
// 이미 작은 파일(300KB 미만)은 건너뜀 → 여러 번 실행해도 안전
// 사용법: node scripts/optimize-images.mjs
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

sharp.cache(false);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const MAX_WIDTH = 1200;
const SKIP_BELOW = 300 * 1024;

let before = 0, after = 0, changed = 0, skipped = 0;
for (const dir of readdirSync(root)) {
  for (const file of readdirSync(join(root, dir)).filter((f) => f.endsWith(".webp"))) {
    const path = join(root, dir, file);
    const size = statSync(path).size;
    before += size;
    if (size < SKIP_BELOW) {
      after += size;
      skipped++;
      continue;
    }
    // 파일을 메모리로 읽은 뒤 덮어씀 (Windows에서 열린 파일 rename 실패 방지)
    const out = await sharp(readFileSync(path))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    writeFileSync(path, out);
    const newSize = statSync(path).size;
    after += newSize;
    changed++;
    console.log(`  ${dir}/${file}: ${(size / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB`);
  }
}
const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(`\n${changed} optimized, ${skipped} already small. Total ${mb(before)}MB → ${mb(after)}MB`);
