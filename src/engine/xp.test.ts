import { describe, it, expect } from "vitest";
import { answerXp, levelFromXp, nextStreak } from "./xp";

describe("xp", () => {
  it("answerXp adds streak bonus capped at 5", () => {
    expect(answerXp(0)).toBe(10);
    expect(answerXp(3)).toBe(16);
    expect(answerXp(10)).toBe(20);
  });
  it("levelFromXp returns level and progress", () => {
    const l0 = levelFromXp(0);
    expect(l0.index).toBe(0);
    expect(l0.label).toBe("A1.1");
    expect(l0.xpForNext).toBe(250);
    const l1 = levelFromXp(300);
    expect(l1.index).toBe(1);
    expect(l1.xpInto).toBe(50);
  });
});

describe("streak", () => {
  it("first ever day -> 1", () => {
    expect(nextStreak({ count: 0, lastDay: null }, "2026-01-01")).toEqual({ count: 1, lastDay: "2026-01-01" });
  });
  it("same day -> unchanged", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-01")).toEqual({ count: 3, lastDay: "2026-01-01" });
  });
  it("consecutive day -> +1", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-02")).toEqual({ count: 4, lastDay: "2026-01-02" });
  });
  it("gap resets to 1", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-05")).toEqual({ count: 1, lastDay: "2026-01-05" });
  });
});
