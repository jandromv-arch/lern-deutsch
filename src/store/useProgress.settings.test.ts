import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => useProgress.getState().reset());

describe("daily counter", () => {
  it("counts answers today and resets across days", () => {
    const g = useProgress.getState();
    g.addAnswer(true, "2026-01-01");
    g.addAnswer(false, "2026-01-01");
    expect(useProgress.getState().answeredToday("2026-01-01")).toBe(2);
    useProgress.getState().addAnswer(true, "2026-01-02");
    expect(useProgress.getState().answeredToday("2026-01-02")).toBe(1);
    expect(useProgress.getState().answeredToday("2026-01-01")).toBe(0);
  });
});
describe("settings", () => {
  it("defaults and setters", () => {
    expect(useProgress.getState().dailyGoal).toBe(15);
    expect(useProgress.getState().soundOn).toBe(true);
    expect(useProgress.getState().themePref).toBe("system");
    useProgress.getState().setSoundOn(false);
    expect(useProgress.getState().soundOn).toBe(false);
    useProgress.getState().setThemePref("dark");
    expect(useProgress.getState().themePref).toBe("dark");
  });
});
