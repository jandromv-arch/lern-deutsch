import type { VocabItem } from "../content/types";

export type ExerciseType = "flashcard" | "qcm" | "fill" | "order" | "type";

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle-and-take always terminates, even with a degenerate injected rand
// (a rejection-sampling loop spins forever when rand() repeats the same value).
function pickDistractors<T>(pool: T[], exclude: (t: T) => boolean, n: number, rand: () => number): T[] {
  return shuffle(pool.filter((t) => !exclude(t)), rand).slice(0, n);
}

export interface Qcm { prompt: string; answer: string; options: string[] }

export function buildQcm(item: VocabItem, pool: VocabItem[], rand: () => number = Math.random): Qcm {
  const distractors = pickDistractors(pool, (p) => p.fr === item.fr, 3, rand).map((p) => p.fr);
  const options = shuffle([item.fr, ...distractors], rand);
  return { prompt: item.de, answer: item.fr, options };
}

export interface Fill { sentenceParts: [string, string]; answer: string; options: string[]; ok: boolean }

const stripArticle = (de: string) => de.replace(/^(der|die|das)\s+/i, "");
const isLetter = (ch: string | undefined) => !!ch && /\p{L}/u.test(ch);

function findSpan(sentence: string, needle: string): number {
  const hay = sentence.toLowerCase();
  const n = needle.toLowerCase();
  let from = 0;
  for (;;) {
    const idx = hay.indexOf(n, from);
    if (idx < 0) return -1;
    if (!isLetter(sentence[idx - 1]) && !isLetter(sentence[idx + n.length])) return idx;
    from = idx + 1;
  }
}

export function buildFill(item: VocabItem, pool: VocabItem[], rand: () => number = Math.random): Fill {
  const target = stripArticle(item.de);
  const sentence = item.example?.de;
  let start = -1;
  let len = 0;
  if (sentence) {
    start = findSpan(sentence, item.de);
    len = item.de.length;
    if (start < 0) {
      start = findSpan(sentence, target);
      len = target.length;
    }
  }
  const ok = !!sentence && start >= 0;
  const answer = ok ? sentence!.slice(start, start + len) : target;
  const parts: [string, string] = ok
    ? [sentence!.slice(0, start), sentence!.slice(start + len)]
    : ["", ""];
  const answerLower = answer.toLowerCase();
  const distractors = pickDistractors(
    pool.map((p) => stripArticle(p.de)),
    (d) => d.toLowerCase() === answerLower,
    2,
    rand
  );
  const options = shuffle([answer, ...distractors], rand);
  return { sentenceParts: parts, answer, options, ok };
}

export interface Order { tiles: string[]; solution: string[]; promptFr: string }

export function buildOrder(item: VocabItem, rand: () => number = Math.random): Order {
  const solution = (item.example?.de ?? item.de).split(/\s+/);
  return { tiles: shuffle(solution, rand), solution, promptFr: item.example?.fr ?? item.fr };
}

export function normalizeGerman(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[.,!?;:]/g, "");
}

export interface Type { promptFr: string; answer: string }

export function buildType(item: VocabItem): Type {
  return { promptFr: item.fr, answer: item.de };
}

export function checkTyped(input: string, answer: string): boolean {
  return normalizeGerman(input) === normalizeGerman(answer);
}
