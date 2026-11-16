import { describe, it, expect } from "vitest";
import { courseEn, dialoguesEn } from "./en";
import { validateCourse } from "./validate";
import { validateDialogues } from "./dialogueTypes";
import { getLanguage, LANGUAGES } from "./languages";

describe("English content", () => {
  it("course is valid", () => expect(validateCourse(courseEn)).toEqual([]));
  it("dialogues are valid", () => expect(validateDialogues(dialoguesEn)).toEqual([]));
  it("has 5 lessons, all gender null", () => {
    expect(courseEn.lessons).toHaveLength(5);
    for (const l of courseEn.lessons) for (const i of l.items) expect(i.gender).toBeNull();
  });
  it("is registered as a language", () => {
    expect(getLanguage("en").course).toBe(courseEn);
    expect(LANGUAGES).toHaveLength(2);
    expect(LANGUAGES[0].id).toBe("de");
  });
});
