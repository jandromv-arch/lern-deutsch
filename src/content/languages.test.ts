import { describe, it, expect } from "vitest";
import { getLanguage, LANGUAGES } from "./languages";
import { course } from "./course";

describe("languages", () => {
  it("returns German course for de", () => {
    expect(getLanguage("de").course).toBe(course);
  });
  it("falls back to first language for unknown id", () => {
    expect(getLanguage("xx")).toBe(LANGUAGES[0]);
  });
});
