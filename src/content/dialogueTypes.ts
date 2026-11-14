export interface DialogueLine {
  speaker: string;
  de: string;
  fr: string;
}

export interface Dialogue {
  id: string;
  title: string;
  emoji: string;
  lines: DialogueLine[];
}

export function validateDialogues(ds: Dialogue[]): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const d of ds) {
    if (seen.has(d.id)) errs.push(`duplicate dialogue id: ${d.id}`);
    seen.add(d.id);
    if (d.lines.length < 2) errs.push(`dialogue ${d.id} needs >=2 lines`);
    for (const [i, l] of d.lines.entries()) {
      if (!l.de.trim()) errs.push(`${d.id} line ${i} missing de`);
      if (!l.fr.trim()) errs.push(`${d.id} line ${i} missing fr`);
    }
  }
  return errs;
}
