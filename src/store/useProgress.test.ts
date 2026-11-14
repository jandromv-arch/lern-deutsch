import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => { useProgress.getState().reset(); });

describe("useProgress", () => {
  it("addAnswer: xp up, items untouched", () => {
    useProgress.getState().addAnswer(true, "2026-01-01");
    const s = useProgress.getState();
    expect(s.xp).toBe(10);
    expect(s.items).toEqual({});
  });
  it("recordItem advances the box once, no xp", () => {
    useProgress.getState().recordItem("a", true, "2026-01-01");
    const s = useProgress.getState();
    expect(s.items["a"].box).toBe(2);
    expect(s.xp).toBe(0);
  });
  it("streak bonus grows with consecutive correct, startSession resets it", () => {
    const g = useProgress.getState();
    g.addAnswer(true, "2026-01-01");
    g.addAnswer(true, "2026-01-01");
    expect(useProgress.getState().xp).toBe(10 + 12);
    g.startSession();
    expect(useProgress.getState().consecutiveCorrect).toBe(0);
    g.addAnswer(true, "2026-01-01");
    expect(useProgress.getState().xp).toBe(10 + 12 + 10);
  });
  it("wrong answer resets consecutive; wrong item resets box", () => {
    const g = useProgress.getState();
    g.addAnswer(true, "2026-01-01");
    g.addAnswer(false, "2026-01-01");
    expect(useProgress.getState().consecutiveCorrect).toBe(0);
    g.recordItem("a", true, "2026-01-01");
    g.recordItem("a", false, "2026-01-01");
    expect(useProgress.getState().items["a"].box).toBe(1);
  });
  it("dueItemIds returns unseen and due items", () => {
    const g = useProgress.getState();
    g.recordItem("a", true, "2026-01-01"); // due 01-02
    const due = g.dueItemIds(["a", "b"], "2026-01-01");
    expect(due).toContain("b"); // unseen
    expect(due).not.toContain("a"); // not due yet
  });
  it("awards 500 XP badge", () => {
    const g = useProgress.getState();
    for (let i = 0; i < 60; i++) g.addAnswer(true, "2026-01-01");
    expect(useProgress.getState().badges).toContain("xp-500");
  });
  it("awardBadge is idempotent", () => {
    const g = useProgress.getState();
    g.awardBadge("unite-terminee");
    g.awardBadge("unite-terminee");
    expect(useProgress.getState().badges).toEqual(["unite-terminee"]);
  });
});
