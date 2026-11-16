import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nextProgress, isMastered, isDue, type ItemProgress } from "../engine/leitner";
import { answerXp, nextStreak } from "../engine/xp";

export type ThemePref = "system" | "light" | "dark";

interface Streak {
  count: number;
  lastDay: string | null;
}

export interface Slice {
  items: Record<string, ItemProgress>;
  xp: number;
  streak: Streak;
  badges: string[];
  consecutiveCorrect: number;
  daily: { day: string; count: number };
}

export const DEFAULT_KEY = "p-default:de";

interface ProgressState {
  slices: Record<string, Slice>;
  activeKey: string;
  setContext: (profileId: string, lang: string) => void;
  dropProfile: (profileId: string) => void;
  items: Record<string, ItemProgress>;
  xp: number;
  streak: Streak;
  badges: string[];
  consecutiveCorrect: number;
  dailyGoal: number;
  daily: { day: string; count: number };
  soundOn: boolean;
  themePref: ThemePref;
  reminderTime: string;
  answeredToday: (today: string) => number;
  setSoundOn: (on: boolean) => void;
  setThemePref: (p: ThemePref) => void;
  setDailyGoal: (n: number) => void;
  setReminderTime: (t: string) => void;
  startSession: () => void;
  addAnswer: (correct: boolean, today: string) => void;
  recordItem: (itemId: string, correct: boolean, today: string) => void;
  awardBadge: (id: string) => void;
  masteredCount: () => number;
  dueItemIds: (allIds: string[], today: string) => string[];
  reset: () => void;
}

const initialSettings = {
  dailyGoal: 15,
  soundOn: true,
  themePref: "system" as ThemePref,
  reminderTime: "19:00",
};

function freshSlice(): Slice {
  return {
    items: {},
    xp: 0,
    streak: { count: 0, lastDay: null },
    badges: [],
    consecutiveCorrect: 0,
    daily: { day: "", count: 0 },
  };
}

function pickSlice(s: Slice): Slice {
  return {
    items: s.items,
    xp: s.xp,
    streak: s.streak,
    badges: s.badges,
    consecutiveCorrect: s.consecutiveCorrect,
    daily: s.daily,
  };
}

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

function commit(
  set: (p: Partial<ProgressState>) => void,
  get: () => ProgressState,
  patch: Partial<Slice>
) {
  const next = pickSlice({ ...get(), ...patch });
  set({ ...next, slices: { ...get().slices, [get().activeKey]: next } });
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialSettings,
      ...freshSlice(),
      slices: {},
      activeKey: DEFAULT_KEY,
      setContext: (profileId, lang) => {
        const key = `${profileId}:${lang}`;
        const s = get();
        if (key === s.activeKey) return;
        const slices = { ...s.slices, [s.activeKey]: pickSlice(s) };
        set({ slices, activeKey: key, ...(slices[key] ?? freshSlice()) });
      },
      dropProfile: (profileId) => {
        const s = get();
        const slices = Object.fromEntries(
          Object.entries(s.slices).filter(([k]) => !k.startsWith(`${profileId}:`))
        );
        if (s.activeKey.startsWith(`${profileId}:`)) {
          set({ slices, activeKey: DEFAULT_KEY, ...(slices[DEFAULT_KEY] ?? freshSlice()) });
        } else {
          set({ slices });
        }
      },
      startSession: () => commit(set, get, { consecutiveCorrect: 0 }),
      addAnswer: (correct, today) => {
        const s = get();
        const xp = correct ? s.xp + answerXp(s.consecutiveCorrect) : s.xp;
        const streak = correct ? nextStreak(s.streak, today) : s.streak;
        commit(set, get, {
          xp,
          streak,
          badges: earnedBadges(s.badges, s.items, xp, streak),
          consecutiveCorrect: correct ? s.consecutiveCorrect + 1 : 0,
          daily:
            s.daily.day !== today
              ? { day: today, count: 1 }
              : { ...s.daily, count: s.daily.count + 1 },
        });
      },
      answeredToday: (today) => {
        const d = get().daily;
        return d.day === today ? d.count : 0;
      },
      setSoundOn: (soundOn) => set({ soundOn }),
      setThemePref: (themePref) => set({ themePref }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      recordItem: (itemId, correct, today) => {
        const s = get();
        const items = { ...s.items, [itemId]: nextProgress(s.items[itemId], correct, today) };
        commit(set, get, { items, badges: earnedBadges(s.badges, items, s.xp, s.streak) });
      },
      awardBadge: (id) => {
        const s = get();
        if (!s.badges.includes(id)) commit(set, get, { badges: [...s.badges, id] });
      },
      masteredCount: () => Object.values(get().items).filter(isMastered).length,
      dueItemIds: (allIds, today) => allIds.filter((id) => isDue(get().items[id], today)),
      reset: () => commit(set, get, freshSlice()),
    }),
    {
      name: "lern-deutsch-v1",
      version: 3,
      migrate: (persisted: unknown) => {
        const p = (persisted && typeof persisted === "object" ? persisted : {}) as Record<string, unknown>;
        const base = { ...initialSettings, ...p } as unknown as ProgressState;
        if (p.items && !p.slices) {
          const fresh = freshSlice();
          const slice: Slice = {
            items: (p.items as Slice["items"]) ?? fresh.items,
            xp: (p.xp as number) ?? fresh.xp,
            streak: (p.streak as Streak) ?? fresh.streak,
            badges: (p.badges as string[]) ?? fresh.badges,
            consecutiveCorrect: (p.consecutiveCorrect as number) ?? fresh.consecutiveCorrect,
            daily: (p.daily as Slice["daily"]) ?? fresh.daily,
          };
          return { ...base, slices: { [DEFAULT_KEY]: slice }, activeKey: DEFAULT_KEY, ...slice } as ProgressState;
        }
        return { ...freshSlice(), ...base, slices: base.slices ?? {}, activeKey: base.activeKey ?? DEFAULT_KEY } as ProgressState;
      },
    }
  )
);
