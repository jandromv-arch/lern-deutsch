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
    expect(f.ok).toBe(true);
  });
  it("blanks the bare noun when the example uses an inflected form", () => {
    const kaffee: VocabItem = {
      id: "k", de: "der Kaffee", fr: "le café", gender: "der",
      example: { de: "Ich trinke einen Kaffee.", fr: "Je bois un café." },
    };
    const f = buildFill(kaffee, [kaffee, ...pool], seq([0, 0, 0]));
    expect(f.ok).toBe(true);
    expect(f.answer).toBe("Kaffee");
    expect(f.sentenceParts).toEqual(["Ich trinke einen ", "."]);
    expect(f.options).toContain("Kaffee");
    expect(f.options).not.toContain("der Kaffee");
  });
  it("preserves original casing of the matched span", () => {
    const gut: VocabItem = { id: "g", de: "gut", fr: "bien", example: { de: "Gut gemacht", fr: "Bien joué" } };
    expect(buildFill(gut, pool, seq([0])).answer).toBe("Gut");
  });
  it("returns ok:false when there is no example or no match", () => {
    const noEx: VocabItem = { id: "n", de: "das Brot", fr: "le pain" };
    expect(buildFill(noEx, pool, seq([0])).ok).toBe(false);
    const noMatch: VocabItem = { id: "m", de: "das Brot", fr: "le pain", example: { de: "Ich esse Reis.", fr: "" } };
    expect(buildFill(noMatch, pool, seq([0])).ok).toBe(false);
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
