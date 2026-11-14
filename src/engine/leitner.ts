export interface ItemProgress {
  box: number;
  dueDate: string; // ISO YYYY-MM-DD
}

export const INTERVALS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
const MAX_BOX = 5;

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nextProgress(
  current: ItemProgress | undefined,
  correct: boolean,
  today: string
): ItemProgress {
  const box = correct ? Math.min((current?.box ?? 1) + 1, MAX_BOX) : 1;
  return { box, dueDate: addDays(today, INTERVALS[box]) };
}

export function isMastered(p: ItemProgress): boolean {
  return p.box >= MAX_BOX;
}

export function isDue(p: ItemProgress | undefined, today: string): boolean {
  if (!p) return true;
  return p.dueDate <= today;
}
