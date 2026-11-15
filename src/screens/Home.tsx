import { Link } from "react-router-dom";
import { course } from "../content/course";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { LevelBar } from "../components/LevelBar";
import { DailyRing } from "../components/DailyRing";
import { ReminderButton } from "../components/ReminderButton";
import { HeaderControls } from "../components/HeaderControls";
import { buildDailyPlan } from "../engine/daily";
import { isMastered } from "../engine/leitner";

const LEVEL_ORDER = ["A1", "A2", "B1"] as const;
const LEVEL_LABELS: Record<(typeof LEVEL_ORDER)[number], string> = {
  A1: "Débutant",
  A2: "Intermédiaire",
  B1: "Avancé",
};

export function Home() {
  const { xp, streak, items, dueItemIds, dailyGoal, answeredToday } = useProgress();
  const started = Object.keys(items);
  const dueCount = dueItemIds(started, today()).length;
  const plan = buildDailyPlan(course, { items }, today());
  const masteredIn = (its: { id: string }[]) =>
    its.filter((it) => items[it.id] && isMastered(items[it.id])).length;
  const levelSections = LEVEL_ORDER.map((level) => {
    const lessons = course.lessons.filter((l) => l.level === level);
    return {
      level,
      lessons,
      mastered: lessons.reduce((n, l) => n + masteredIn(l.items), 0),
      total: lessons.reduce((n, l) => n + l.items.length, 0),
    };
  }).filter((s) => s.lessons.length > 0);
  return (
    <div className="p-4 space-y-5">
      <header className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lern Deutsch 🇩🇪</h1>
          <HeaderControls />
        </div>
        <div className="flex items-center gap-3">
          <DailyRing count={answeredToday(today())} goal={dailyGoal} />
          <div className="flex-1 space-y-1">
            <div className="text-sm">🔥 {streak.count}</div>
            <LevelBar xp={xp} />
          </div>
        </div>
        {dueCount > 0 && (
          <Link to="/review" className="block text-center py-2 rounded-xl bg-accent/10 text-accent font-semibold">
            {dueCount} mots à réviser aujourd'hui →
          </Link>
        )}
      </header>
      <Link to="/daily" className="block text-center p-4 rounded-2xl bg-accent text-white shadow">
        <div className="font-bold text-lg">Leçon du jour</div>
        <div className="text-sm opacity-90">{plan.reviewIds.length} à réviser · {plan.newIds.length} nouveaux</div>
      </Link>
      <Link to="/dialogues" className="block text-center p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm font-semibold">
        Dialogues 💬
      </Link>
      <Link to="/grammar" className="block text-center p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm font-semibold">
        Grammaire 📚
      </Link>
      {answeredToday(today()) === 0 && (
        <Link to="/daily" className="block text-center p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-semibold">
          N'oublie pas ta leçon du jour 🔥 pour garder ta série !
        </Link>
      )}
      {levelSections.map(({ level, lessons, mastered, total }) => (
        <section key={level} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <h2 className="font-bold">{level} · {LEVEL_LABELS[level]}</h2>
            <span className="text-xs text-neutral-400">{mastered}/{total} mots</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lessons.map((l) => {
              const m = masteredIn(l.items);
              return (
                <Link key={l.id} to={`/lesson/${l.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex flex-col gap-1">
                  <div className="text-2xl">{l.emoji}</div>
                  <div className="font-semibold text-sm">{l.title}</div>
                  <div className="text-xs text-neutral-400">{m}/{l.items.length} maîtrisés</div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="font-semibold text-sm">Rappel</h2>
        <ReminderButton />
      </section>
    </div>
  );
}
