import type { ExerciseType } from "./exercises";
import type { VocabItem } from "../content/types";

export interface Step { itemId: string; type: ExerciseType }

const LESSON_ORDER: ExerciseType[] = ["flashcard", "qcm", "fill", "order"];
const REVIEW_TYPES: ExerciseType[] = ["qcm", "fill", "order", "type"];

export function buildLessonQueue(items: VocabItem[]): Step[] {
  return items.flatMap((item) => LESSON_ORDER.map((type) => ({ itemId: item.id, type })));
}

export function buildReviewQueue(items: VocabItem[], rand: () => number = Math.random): Step[] {
  const shuffled = [...items].sort(() => rand() - 0.5);
  return shuffled.map((item, i) => ({
    itemId: item.id,
    type: REVIEW_TYPES[i % REVIEW_TYPES.length],
  }));
}
