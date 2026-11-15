// Extracts every unique German string the app ever speaks (vocab words,
// example sentences, dialogue lines) and writes them to a JSON list.
// Run with: npx vite-node scripts/extract-de.ts
import { writeFileSync } from "node:fs";
import { course } from "../src/content/course";
import { dialogues } from "../src/content/dialogues";

const set = new Set<string>();
for (const lesson of course.lessons) {
  for (const it of lesson.items) {
    if (it.de?.trim()) set.add(it.de.trim());
    if (it.example?.de?.trim()) set.add(it.example.de.trim());
  }
}
for (const d of dialogues) {
  for (const line of d.lines) {
    if (line.de?.trim()) set.add(line.de.trim());
  }
}

const list = [...set].sort();
const out = process.argv[2] || "de-strings.json";
writeFileSync(out, JSON.stringify(list, null, 2));
console.log(`wrote ${list.length} unique German strings to ${out}`);
