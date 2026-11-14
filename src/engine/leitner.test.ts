import { describe, it, expect } from "vitest";
import { nextProgress, isMastered, isDue, addDays } from "./leitner";

describe("leitner", () => {
  it("addDays computes ISO dates", () => {
    expect(addDays("2026-01-01", 3)).toBe("2026-01-04");
  });
  it("new item correct -> box 2 due tomorrow", () => {
    const p = nextProgress(undefined, true, "2026-01-01");
    expect(p.box).toBe(2);
    expect(p.dueDate).toBe("2026-01-02");
  });
  it("wrong answer resets to box 1 due same day", () => {
    const p = nextProgress({ box: 4, dueDate: "2026-01-10" }, false, "2026-01-05");
    expect(p.box).toBe(1);
    expect(p.dueDate).toBe("2026-01-05");
  });
  it("box caps at 5", () => {
    const p = nextProgress({ box: 5, dueDate: "2026-01-01" }, true, "2026-01-01");
    expect(p.box).toBe(5);
    expect(isMastered(p)).toBe(true);
  });
  it("isDue true when dueDate <= today", () => {
    expect(isDue({ box: 2, dueDate: "2026-01-01" }, "2026-01-02")).toBe(true);
    expect(isDue({ box: 2, dueDate: "2026-01-03" }, "2026-01-02")).toBe(false);
    expect(isDue(undefined, "2026-01-02")).toBe(true);
  });
});
