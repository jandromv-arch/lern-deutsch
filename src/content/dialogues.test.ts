import { describe, it, expect } from "vitest";
import { dialogues } from "./dialogues";
import { validateDialogues } from "./dialogueTypes";

describe("dialogues", () => {
  it("are valid", () => {
    expect(validateDialogues(dialogues)).toEqual([]);
  });
  it("has ~5 dialogues with >=2 lines each", () => {
    expect(dialogues.length).toBeGreaterThanOrEqual(5);
    for (const d of dialogues) expect(d.lines.length).toBeGreaterThanOrEqual(2);
  });
});
