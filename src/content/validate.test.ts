import { describe, it, expect } from "vitest";
import { validateCourse } from "./validate";
import type { Course } from "./types";

const base: Course = {
  id: "de-fr-a1",
  from: "fr",
  to: "de",
  lessons: [
    { id: "l1", title: "T", emoji: "☕", items: [
      { id: "a1", de: "Hallo", fr: "Bonjour", gender: null },
    ] },
  ],
};

describe("validateCourse", () => {
  it("accepts a valid course", () => {
    expect(validateCourse(base)).toEqual([]);
  });
  it("flags duplicate item ids", () => {
    const c: Course = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "dup", de: "A", fr: "a" }, { id: "dup", de: "B", fr: "b" },
    ] }] };
    expect(validateCourse(c).some((e) => e.includes("dup"))).toBe(true);
  });
  it("flags missing fr or de", () => {
    const c: Course = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "x", de: "", fr: "a" },
    ] }] };
    expect(validateCourse(c).length).toBeGreaterThan(0);
  });
  it("flags invalid gender", () => {
    const c = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "x", de: "A", fr: "a", gender: "le" as unknown as null },
    ] }] } as Course;
    expect(validateCourse(c).length).toBeGreaterThan(0);
  });
});
