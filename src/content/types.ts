export type Gender = "der" | "die" | "das" | null;

export type Level = "A1" | "A2" | "B1";

export interface VocabItem {
  id: string;
  de: string;
  fr: string;
  gender?: Gender;
  example?: { de: string; fr: string };
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  level: Level;
  grammarTip?: { title: string; body: string };
  items: VocabItem[];
}

export interface Course {
  id: string;
  from: "fr";
  to: "de" | "en";
  lessons: Lesson[];
}
