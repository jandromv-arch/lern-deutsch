import { addDays } from "./leitner";

export const XP_PER_CORRECT = 10;
const XP_PER_LEVEL = 250;
const LEVEL_LABELS = ["A1.1", "A1.2", "A1.3", "A1.4", "A2.1", "A2.2", "A2.3", "A2.4"];

export function answerXp(consecutiveCorrect: number): number {
  return XP_PER_CORRECT + Math.min(consecutiveCorrect, 5) * 2;
}

export interface Level {
  label: string;
  index: number;
  xpInto: number;
  xpForNext: number;
}

export function levelFromXp(totalXp: number): Level {
  const index = Math.floor(totalXp / XP_PER_LEVEL);
  const label = LEVEL_LABELS[Math.min(index, LEVEL_LABELS.length - 1)];
  return { label, index, xpInto: totalXp % XP_PER_LEVEL, xpForNext: XP_PER_LEVEL };
}

export function nextStreak(
  prev: { count: number; lastDay: string | null },
  today: string
): { count: number; lastDay: string } {
  if (prev.lastDay === today) return { count: prev.count, lastDay: today };
  if (prev.lastDay && addDays(prev.lastDay, 1) === today)
    return { count: prev.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}
