// Extracts every unique target-language string the app ever speaks (vocab,
// example sentences, dialogue lines) for one or all registered languages.
// Run with: npx vite-node scripts/extract-de.ts <out.json> [langId]
// langId filters to a single language (e.g. "en"); omit for ALL languages.
import { writeFileSync } from "node:fs";
import { LANGUAGES } from "../src/content/languages";

const out = process.argv[2] || "strings.json";
const onlyLang = process.argv[3];

const set = new Set<string>();
for (const lang of LANGUAGES) {
  if (onlyLang && lang.id !== onlyLang) continue;
  for (const lesson of lang.course.lessons) {
    for (const it of lesson.items) {
      if (it.de?.trim()) set.add(it.de.trim());
      if (it.example?.de?.trim()) set.add(it.example.de.trim());
    }
  }
  for (const d of lang.dialogues) {
    for (const line of d.lines) {
      if (line.de?.trim()) set.add(line.de.trim());
    }
  }
}

const list = [...set].sort();
writeFileSync(out, JSON.stringify(list, null, 2));
console.log(`wrote ${list.length} unique strings${onlyLang ? ` (${onlyLang})` : " (all languages)"} to ${out}`);
