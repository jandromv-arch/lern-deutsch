import { describe, it, expect } from "vitest";
import { buildLessonQueue, buildReviewQueue } from "./session";
import type { VocabItem } from "../content/types";

const items: VocabItem[] = [
  { id: "a", de: "A", fr: "a" },
  { id: "b", de: "B", fr: "b" },
];

describe("buildLessonQueue", () => {
  it("produces 4 steps per item in fixed order", () => {
    const q = buildLessonQueue(items);
    expect(q.length).toBe(8);
    expect(q.slice(0, 4).map((s) => s.type)).toEqual(["flashcard", "qcm", "fill", "order"]);
    expect(q[0].itemId).toBe("a");
  });
});

describe("buildReviewQueue", () => {
  it("one step per item, never flashcard", () => {
    const q = buildReviewQueue(items, () => 0);
    expect(q.length).toBe(2);
    expect(q.every((s) => s.type !== "flashcard")).toBe(true);
  });
});
