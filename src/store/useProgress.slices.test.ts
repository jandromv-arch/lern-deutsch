import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => {
  useProgress.setState({ slices: {}, activeKey: "p-default:de" });
  useProgress.getState().reset();
});

describe("useProgress slices", () => {
  it("isolates progress per key and restores it", () => {
    const g = () => useProgress.getState();
    g().setContext("A", "de");
    g().addAnswer(true, "2026-01-01");
    g().recordItem("x", true, "2026-01-01");
    g().setContext("B", "de");
    expect(g().xp).toBe(0);
    expect(g().items).toEqual({});
    g().addAnswer(true, "2026-01-01");
    g().addAnswer(true, "2026-01-01");
    g().setContext("A", "de");
    expect(g().xp).toBe(10);
    expect(g().items["x"]).toBeDefined();
    g().setContext("A", "en");
    expect(g().xp).toBe(0);
  });
  it("reset clears only the active slice, keeps settings", () => {
    const g = () => useProgress.getState();
    g().setContext("A", "de");
    g().addAnswer(true, "2026-01-01");
    g().setContext("B", "de");
    g().addAnswer(true, "2026-01-01");
    g().setDailyGoal(30);
    g().reset();
    expect(g().xp).toBe(0);
    expect(g().slices["B:de"].xp).toBe(0);
    expect(g().slices["A:de"].xp).toBe(10);
    expect(g().dailyGoal).toBe(30);
  });
  it("migrates a v2 blob into slices[p-default:de]", async () => {
    localStorage.setItem(
      "lern-deutsch-v1",
      JSON.stringify({
        version: 2,
        state: { items: { a: { box: 3, due: "2026-01-02" } }, xp: 77, streak: { count: 2, lastDay: "2026-01-01" }, badges: ["xp-500"], consecutiveCorrect: 0, daily: { day: "2026-01-01", count: 4 }, dailyGoal: 20, soundOn: false },
      })
    );
    await useProgress.persist.rehydrate();
    const s = useProgress.getState();
    expect(s.xp).toBe(77);
    expect(s.activeKey).toBe("p-default:de");
    expect(s.slices["p-default:de"].xp).toBe(77);
    expect(s.slices["p-default:de"].items["a"]).toBeDefined();
    expect(s.dailyGoal).toBe(20);
    expect(s.soundOn).toBe(false);
  });
});
