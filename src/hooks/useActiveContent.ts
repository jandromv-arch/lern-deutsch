import type { Course } from "../content/types";
import type { Dialogue } from "../content/dialogueTypes";
import { getLanguage } from "../content/languages";
import { useAccount } from "../store/useAccount";

// Single seam: the active profile's language content (fallback "de").
export function useActiveContent(): { lang: string; course: Course; dialogues: Dialogue[] } {
  const profiles = useAccount((s) => s.profiles);
  const activeId = useAccount((s) => s.activeId);
  const lang = profiles.find((p) => p.id === activeId)?.lang ?? "de";
  const l = getLanguage(lang);
  return { lang: l.id, course: l.course, dialogues: l.dialogues };
}
