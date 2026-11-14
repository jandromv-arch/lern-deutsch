import { describe, it, expect } from "vitest";
import { normalizeGerman, buildType, checkTyped } from "./exercises";
import type { VocabItem } from "../content/types";

describe("normalizeGerman", () => {
  it("is case-insensitive and maps umlauts/ß", () => {
    expect(normalizeGerman("Straße")).toBe(normalizeGerman("strasse"));
    expect(normalizeGerman("schön")).toBe(normalizeGerman("schoen"));
    expect(normalizeGerman("  Tschüss ")).toBe(normalizeGerman("tschuess"));
  });
});
describe("buildType + checkTyped", () => {
  const item: VocabItem = { id: "x", de: "der Käse", fr: "le fromage", gender: "der" };
  it("builds from fr→de", () => {
    const t = buildType(item);
    expect(t.promptFr).toBe("le fromage");
    expect(t.answer).toBe("der Käse");
  });
  it("accepts lenient input", () => {
    expect(checkTyped("der kaese", "der Käse")).toBe(true);
    expect(checkTyped("der Käse", "der Käse")).toBe(true);
    expect(checkTyped("kase", "der Käse")).toBe(false);
  });
});
