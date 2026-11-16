import type { Course } from "./types";
import type { Dialogue } from "./dialogueTypes";
import { course } from "./course";
import { dialogues } from "./dialogues";

export interface LanguageDef {
  id: string;
  label: string;
  flag: string;
  course: Course;
  dialogues: Dialogue[];
}

export const LANGUAGES: LanguageDef[] = [
  { id: "de", label: "Allemand", flag: "🇩🇪", course, dialogues },
];

export function getLanguage(id: string): LanguageDef {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}
