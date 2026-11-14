import { describe, it, expect } from "vitest";
import { buildQcm, buildFill, buildOrder } from "./exercises";
import type { VocabItem } from "../content/types";

const seq = (nums: number[]) => { let i = 0; return () => nums[i++ % nums.length]; };

const item: VocabItem = {
  id: "x", de: "Hallo", fr: "Bonjour", gender: null,
  example: { de: "Hallo Welt", fr: "Bonjour le monde" },
};
const pool: VocabItem[] = [
  item,
  { id: "a", de: "Danke", fr: "Merci" },
  { id: "b", de: "Ja", fr: "Oui" },
  { id: "c", de: "Nein", fr: "Non" },
];

describe("buildQcm", () => {
  it("prompt is German, answer is French, 4 unique options incl answer", () => {
    const q = buildQcm(item, pool, seq([0, 0, 0]));
    expect(q.prompt).toBe("Hallo");
    expect(q.answer).toBe("Bonjour");
    expect(q.options).toContain("Bonjour");
    expect(q.options.length).toBe(4);
    expect(new Set(q.options).size).toBe(4);
  });
});

describe("buildFill", () => {
  it("splits example around the target word", () => {
    const f = buildFill(item, pool, seq([0, 0, 0]));
    expect(f.answer).toBe("Hallo");
    expect(f.sentenceParts[0] + "___" + f.sentenceParts[1]).toContain("___ Welt");
    expect(f.options).toContain("Hallo");
  });
});

describe("buildOrder", () => {
  it("tiles are the solution words shuffled", () => {
    const o = buildOrder(item, seq([0.9, 0.1]));
    expect(o.solution).toEqual(["Hallo", "Welt"]);
    expect([...o.tiles].sort()).toEqual([...o.solution].sort());
    expect(o.promptFr).toBe("Bonjour le monde");
  });
});
