import { describe, it, expect } from "vitest";
import { buildDailyPlan } from "./daily";
import type { Course } from "../content/types";

const mk = (id: string) => ({ id, de: id, fr: id });
const course: Course = {
  id: "c", from: "fr", to: "de",
  lessons: [
    { id: "l1", title: "L1", emoji: "1", level: "A1", items: ["a", "b", "c"].map(mk) },
    { id: "l2", title: "L2", emoji: "2", level: "A1", items: ["d", "e", "f"].map(mk) },
  ],
};
const T = "2026-01-10";

describe("buildDailyPlan", () => {
  it("includes due started items and unseen items of the first incomplete lesson", () => {
    const p = buildDailyPlan(course, { items: { a: { box: 1, dueDate: T } } }, T);
    expect(p.reviewIds).toEqual(["a"]);
    expect(p.newIds).toEqual(["b", "c"]);
    expect(p.steps.every((s) => p.itemsById[s.itemId])).toBe(true);
  });
  it("skips not-due items", () => {
    const p = buildDailyPlan(course, { items: { a: { box: 3, dueDate: "2026-02-01" } } }, T);
    expect(p.reviewIds).toEqual([]);
  });
  it("respects newCount", () => {
    const p = buildDailyPlan(course, { items: {} }, T, { newCount: 2 });
    expect(p.newIds).toEqual(["a", "b"]);
  });
  it("caps distinct items at maxItems, keeping review first", () => {
    const items = { a: { box: 1, dueDate: T }, b: { box: 1, dueDate: T } };
    const p = buildDailyPlan(course, { items }, T, { maxItems: 3 });
    expect(p.reviewIds.length).toBe(2);
    expect(p.newIds.length).toBe(1);
    expect(new Set(p.steps.map((s) => s.itemId)).size).toBeLessThanOrEqual(3);
    expect(Object.keys(p.itemsById).length).toBe(3);
  });
  it("is empty when nothing due and newCount 0", () => {
    const p = buildDailyPlan(course, { items: {} }, T, { newCount: 0 });
    expect(p).toEqual({ reviewIds: [], newIds: [], steps: [], itemsById: {} });
  });
  it("is empty when everything started and not due", () => {
    const items = Object.fromEntries(["a", "b", "c", "d", "e", "f"].map((i) => [i, { box: 5, dueDate: "2027-01-01" }]));
    const p = buildDailyPlan(course, { items }, T);
    expect(p.steps).toEqual([]);
  });
});
