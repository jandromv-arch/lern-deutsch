import { describe, it, expect } from "vitest";
import { course } from "./course";
import { validateCourse } from "./validate";

describe("seed course", () => {
  it("is valid", () => {
    expect(validateCourse(course)).toEqual([]);
  });
  it("has at least 29 lessons and 540+ items", () => {
    expect(course.lessons.length).toBeGreaterThanOrEqual(29);
    const total = course.lessons.reduce((n, l) => n + l.items.length, 0);
    expect(total).toBeGreaterThanOrEqual(540);
  });
  it("has 8 A2 lessons placed after the A1 lessons, 4+ with grammar tips", () => {
    const a2 = course.lessons.filter((l) => l.level === "A2");
    expect(a2.length).toBeGreaterThanOrEqual(8);
    const firstA2 = course.lessons.findIndex((l) => l.level === "A2");
    expect(course.lessons.slice(firstA2).every((l) => l.level !== "A1")).toBe(true);
    expect(a2.filter((l) => l.grammarTip).length).toBeGreaterThanOrEqual(4);
  });
  it("has 6 B1 lessons placed after A2, 3+ with grammar tips", () => {
    const b1 = course.lessons.filter((l) => l.level === "B1");
    expect(b1.length).toBeGreaterThanOrEqual(6);
    const firstB1 = course.lessons.findIndex((l) => l.level === "B1");
    expect(course.lessons.slice(firstB1).every((l) => l.level === "B1")).toBe(true);
    expect(b1.filter((l) => l.grammarTip).length).toBeGreaterThanOrEqual(3);
  });
  it("nouns with der/die/das prefix carry matching gender", () => {
    for (const l of course.lessons)
      for (const it of l.items) {
        const m = it.de.match(/^(der|die|das)\s/);
        if (m) expect(it.gender).toBe(m[1]);
      }
  });
});
