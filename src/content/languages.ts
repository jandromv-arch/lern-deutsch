import type { Course } from "./types";
import type { Dialogue } from "./dialogueTypes";
import { course } from "./course";
import { dialogues } from "./dialogues";
import { courseEn, dialoguesEn } from "./en";

export interface LanguageDef {
  id: string;
  label: string;
  flag: string;
  course: Course;
  dialogues: Dialogue[];
}

export const LANGUAGES: LanguageDef[] = [
  { id: "de", label: "Allemand", flag: "🇩🇪", course, dialogues },
  { id: "en", label: "Anglais", flag: "🇬🇧", course: courseEn, dialogues: dialoguesEn },
];

export function getLanguage(id: string): LanguageDef {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}
