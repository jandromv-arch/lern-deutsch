import type { VocabItem } from "../types";

// [english, french, exampleEnglish?, exampleFrench?]
export type Row = [string, string, string?, string?];

export function items(prefix: string, rows: Row[]): VocabItem[] {
  return rows.map(([de, fr, ex, exFr], i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    de,
    fr,
    gender: null,
    ...(ex && exFr ? { example: { de: ex, fr: exFr } } : {}),
  }));
}
