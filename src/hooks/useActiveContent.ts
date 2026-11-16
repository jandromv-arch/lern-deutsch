import type { Course } from "../content/types";
import type { Dialogue } from "../content/dialogueTypes";
import { getLanguage } from "../content/languages";

// Single seam: the active language's content. Task 2 will read the active profile's lang here.
export function useActiveContent(): { lang: string; course: Course; dialogues: Dialogue[] } {
  const l = getLanguage("de");
  return { lang: l.id, course: l.course, dialogues: l.dialogues };
}
