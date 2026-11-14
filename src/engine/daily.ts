import type { Course, VocabItem } from "../content/types";
import { isDue, type ItemProgress } from "./leitner";
import { buildLessonQueue, buildReviewQueue, type Step } from "./session";

export interface DailyPlan {
  reviewIds: string[];
  newIds: string[];
  steps: Step[];
  itemsById: Record<string, VocabItem>;
}

export function buildDailyPlan(
  course: Course,
  progress: { items: Record<string, ItemProgress> },
  today: string,
  opts: { newCount?: number; maxItems?: number } = {}
): DailyPlan {
  const newCount = opts.newCount ?? 10;
  const maxItems = opts.maxItems ?? 20;
  const all = course.lessons.flatMap((l) => l.items);
  const byId = new Map(all.map((it) => [it.id, it]));

  const reviewItems = Object.keys(progress.items)
    .filter((id) => byId.has(id) && isDue(progress.items[id], today))
    .map((id) => byId.get(id)!)
    .slice(0, maxItems);

  const lesson = course.lessons.find((l) => l.items.some((it) => !progress.items[it.id]));
  const room = Math.max(0, Math.min(newCount, maxItems - reviewItems.length));
  const newItems = lesson ? lesson.items.filter((it) => !progress.items[it.id]).slice(0, room) : [];

  const steps = [...buildReviewQueue(reviewItems), ...buildLessonQueue(newItems)];
  const itemsById = Object.fromEntries([...reviewItems, ...newItems].map((it) => [it.id, it]));
  return {
    reviewIds: reviewItems.map((it) => it.id),
    newIds: newItems.map((it) => it.id),
    steps,
    itemsById,
  };
}
