import { useActiveContent } from "../hooks/useActiveContent";
import { useProgress } from "../store/useProgress";
import { isMastered } from "../engine/leitner";
import { levelFromXp } from "../engine/xp";
import { ProfileSwitcher } from "../components/ProfileSwitcher";
import { LevelBar } from "../components/LevelBar";

const BADGE_LABELS: Record<string, string> = {
  "mots-100": "100 mots 📚", "jours-7": "7 jours 🔥", "xp-500": "500 XP ⭐", "unite-terminee": "Unité terminée 🏅",
};

export function Progress() {
  const { course } = useActiveContent();
  const { xp, streak, items, badges } = useProgress();
  const allItems = course.lessons.flatMap((l) => l.items);
  const mastered = allItems.filter((it) => items[it.id] && isMastered(items[it.id])).length;
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Progrès</h1>
      <ProfileSwitcher />
      <LevelBar xp={xp} />
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat value={`${mastered}/${allItems.length}`} label="maîtrisés" />
        <Stat value={levelFromXp(xp).label} label="niveau" />
        <Stat value={`🔥 ${streak.count}`} label="jours" />
      </div>
      <section>
        <h2 className="font-semibold mb-2">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(BADGE_LABELS).map((b) => (
            <span key={b} className={`px-3 py-2 rounded-xl text-sm ${badges.includes(b) ? "bg-accent text-white" : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"}`}>
              {BADGE_LABELS[b]}
            </span>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Par leçon</h2>
        {course.lessons.map((l) => {
          const m = l.items.filter((it) => items[it.id] && isMastered(items[it.id])).length;
          return (
            <div key={l.id} className="flex items-center gap-2 text-sm">
              <span>{l.emoji}</span><span className="flex-1">{l.title}</span>
              <span className="text-neutral-400">{m}/{l.items.length}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
      <div className="font-bold">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  );
}
