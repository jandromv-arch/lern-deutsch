import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nextProgress, isMastered, isDue, type ItemProgress } from "../engine/leitner";
import { answerXp, nextStreak } from "../engine/xp";

interface Streak {
  count: number;
  lastDay: string | null;
}

interface ProgressState {
  items: Record<string, ItemProgress>;
  xp: number;
  streak: Streak;
  badges: string[];
  consecutiveCorrect: number;
  startSession: () => void;
  addAnswer: (correct: boolean, today: string) => void;
  recordItem: (itemId: string, correct: boolean, today: string) => void;
  awardBadge: (id: string) => void;
  masteredCount: () => number;
  dueItemIds: (allIds: string[], today: string) => string[];
  reset: () => void;
}

const initial = {
  items: {} as Record<string, ItemProgress>,
  xp: 0,
  streak: { count: 0, lastDay: null } as Streak,
  badges: [] as string[],
  consecutiveCorrect: 0,
};

function earnedBadges(
  badges: string[],
  items: Record<string, ItemProgress>,
  xp: number,
  streak: Streak
): string[] {
  const earned = new Set(badges);
  if (Object.values(items).filter(isMastered).length >= 100) earned.add("mots-100");
  if (streak.count >= 7) earned.add("jours-7");
  if (xp >= 500) earned.add("xp-500");
  return [...earned];
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      startSession: () => set({ consecutiveCorrect: 0 }),
      addAnswer: (correct, today) => {
        const s = get();
        const xp = correct ? s.xp + answerXp(s.consecutiveCorrect) : s.xp;
        const streak = correct ? nextStreak(s.streak, today) : s.streak;
        set({
          xp,
          streak,
          badges: earnedBadges(s.badges, s.items, xp, streak),
          consecutiveCorrect: correct ? s.consecutiveCorrect + 1 : 0,
        });
      },
      recordItem: (itemId, correct, today) => {
        const s = get();
        const items = { ...s.items, [itemId]: nextProgress(s.items[itemId], correct, today) };
        set({ items, badges: earnedBadges(s.badges, items, s.xp, s.streak) });
      },
      awardBadge: (id) => {
        const s = get();
        if (!s.badges.includes(id)) set({ badges: [...s.badges, id] });
      },
      masteredCount: () => Object.values(get().items).filter(isMastered).length,
      dueItemIds: (allIds, today) => allIds.filter((id) => isDue(get().items[id], today)),
      reset: () => set({ ...initial }),
    }),
    { name: "lern-deutsch-v1", version: 1 }
  )
);
