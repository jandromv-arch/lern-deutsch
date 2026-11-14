import { describe, it, expect } from "vitest";
import { course } from "./course";
import { validateCourse } from "./validate";

describe("seed course", () => {
  it("is valid", () => {
    expect(validateCourse(course)).toEqual([]);
  });
  it("has 15 lessons and ~300 items", () => {
    expect(course.lessons.length).toBe(15);
    const total = course.lessons.reduce((n, l) => n + l.items.length, 0);
    expect(total).toBeGreaterThanOrEqual(270);
  });
  it("nouns with der/die/das prefix carry matching gender", () => {
    for (const l of course.lessons)
      for (const it of l.items) {
        const m = it.de.match(/^(der|die|das)\s/);
        if (m) expect(it.gender).toBe(m[1]);
      }
  });
});
