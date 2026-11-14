export type Gender = "der" | "die" | "das" | null;

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
  items: VocabItem[];
}

export interface Course {
  id: string;
  from: "fr";
  to: "de";
  lessons: Lesson[];
}
