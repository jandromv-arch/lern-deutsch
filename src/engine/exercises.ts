import type { VocabItem } from "../content/types";

export type ExerciseType = "flashcard" | "qcm" | "fill" | "order";

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

export interface Fill { sentenceParts: [string, string]; answer: string; options: string[] }

export function buildFill(item: VocabItem, pool: VocabItem[], rand: () => number = Math.random): Fill {
  const sentence = item.example?.de ?? item.de;
  const idx = sentence.indexOf(item.de);
  const parts: [string, string] = idx >= 0
    ? [sentence.slice(0, idx), sentence.slice(idx + item.de.length)]
    : ["", ""];
  const distractors = pickDistractors(pool, (p) => p.de === item.de, 2, rand).map((p) => p.de);
  const options = shuffle([item.de, ...distractors], rand);
  return { sentenceParts: parts, answer: item.de, options };
}

export interface Order { tiles: string[]; solution: string[]; promptFr: string }

export function buildOrder(item: VocabItem, rand: () => number = Math.random): Order {
  const solution = (item.example?.de ?? item.de).split(/\s+/);
  return { tiles: shuffle(solution, rand), solution, promptFr: item.example?.fr ?? item.fr };
}
