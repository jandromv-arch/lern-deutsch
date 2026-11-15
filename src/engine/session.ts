import type { ExerciseType } from "./exercises";
import type { VocabItem } from "../content/types";

export interface Step { itemId: string; type: ExerciseType }

const PRACTICE_TYPES: ExerciseType[] = ["qcm", "fill", "order", "type", "listen"];
const REVIEW_TYPES: ExerciseType[] = ["qcm", "fill", "order", "type", "listen"];

// A lesson introduces each word with a flashcard, then drills it with TWO
// different practice exercises. The practice types rotate per item so that
// across a lesson all five types (qcm, fill, order, type, listen) appear,
// without making every word a 6-step slog.
export function buildLessonQueue(items: VocabItem[]): Step[] {
  const steps: Step[] = [];
  const n = PRACTICE_TYPES.length;
  items.forEach((item, i) => {
    steps.push({ itemId: item.id, type: "flashcard" });
    steps.push({ itemId: item.id, type: PRACTICE_TYPES[i % n] });
    steps.push({ itemId: item.id, type: PRACTICE_TYPES[(i + 2) % n] });
  });
  return steps;
}

export function buildReviewQueue(items: VocabItem[], rand: () => number = Math.random): Step[] {
  const shuffled = [...items].sort(() => rand() - 0.5);
  return shuffled.map((item, i) => ({
    itemId: item.id,
    type: REVIEW_TYPES[i % REVIEW_TYPES.length],
  }));
}
