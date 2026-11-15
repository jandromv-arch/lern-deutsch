import { describe, it, expect } from "vitest";
import { buildLessonQueue, buildReviewQueue } from "./session";
import type { VocabItem } from "../content/types";

const items: VocabItem[] = [
  { id: "a", de: "A", fr: "a" },
  { id: "b", de: "B", fr: "b" },
];

describe("buildLessonQueue", () => {
  it("gives each item a flashcard + two practice exercises", () => {
    const q = buildLessonQueue(items);
    expect(q.length).toBe(6); // 2 items × 3 steps
    // item "a" (i=0): flashcard, qcm, order
    expect(q.slice(0, 3)).toEqual([
      { itemId: "a", type: "flashcard" },
      { itemId: "a", type: "qcm" },
      { itemId: "a", type: "order" },
    ]);
    // item "b" (i=1): flashcard, fill, type
    expect(q.slice(3, 6).map((s) => s.type)).toEqual(["flashcard", "fill", "type"]);
  });
  it("across a lesson all five practice types appear and the first step is a flashcard", () => {
    const many: VocabItem[] = Array.from({ length: 10 }, (_, i) => ({ id: `i${i}`, de: `D${i}`, fr: `f${i}` }));
    const q = buildLessonQueue(many);
    expect(q[0].type).toBe("flashcard");
    const practice = new Set(q.filter((s) => s.type !== "flashcard").map((s) => s.type));
    for (const t of ["qcm", "fill", "order", "type", "listen"]) expect(practice.has(t as never)).toBe(true);
  });
});

describe("buildReviewQueue", () => {
  it("one step per item, never flashcard", () => {
    const q = buildReviewQueue(items, () => 0);
    expect(q.length).toBe(2);
    expect(q.every((s) => s.type !== "flashcard")).toBe(true);
  });
  it("rotation can include type and never flashcard", () => {
    const many: VocabItem[] = Array.from({ length: 8 }, (_, i) => ({ id: `i${i}`, de: `D${i}`, fr: `f${i}` }));
    const q = buildReviewQueue(many, () => 0);
    const types = new Set(q.map((s) => s.type));
    expect(types.has("type")).toBe(true);
    expect(types.has("listen")).toBe(true);
    expect(types.has("flashcard")).toBe(false);
  });
});
