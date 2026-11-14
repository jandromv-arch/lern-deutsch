import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => { useProgress.getState().reset(); });

describe("useProgress", () => {
  it("records a correct answer: xp up, item advanced", () => {
    useProgress.getState().recordAnswer("a", true, "2026-01-01");
    const s = useProgress.getState();
    expect(s.xp).toBe(10);
    expect(s.items["a"].box).toBe(2);
  });
  it("streak bonus grows with consecutive correct", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01");
    g.recordAnswer("b", true, "2026-01-01");
    expect(useProgress.getState().xp).toBe(10 + 12);
  });
  it("wrong answer resets consecutive and box", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01");
    g.recordAnswer("a", false, "2026-01-01");
    expect(useProgress.getState().items["a"].box).toBe(1);
    expect(useProgress.getState().consecutiveCorrect).toBe(0);
  });
  it("dueItemIds returns unseen and due items", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01"); // due 01-02
    const due = g.dueItemIds(["a", "b"], "2026-01-01");
    expect(due).toContain("b"); // unseen
    expect(due).not.toContain("a"); // not due yet
  });
  it("awards 500 XP badge", () => {
    const g = useProgress.getState();
    for (let i = 0; i < 60; i++) g.recordAnswer("x" + i, true, "2026-01-01");
    expect(useProgress.getState().badges).toContain("xp-500");
  });
});
