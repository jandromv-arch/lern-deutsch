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

export function Home() {
  const { xp, streak, items, dueItemIds, dailyGoal, answeredToday } = useProgress();
  const started = Object.keys(items);
  const dueCount = dueItemIds(started, today()).length;
  const plan = buildDailyPlan(course, { items }, today());
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
      <div className="grid grid-cols-2 gap-3">
        {course.lessons.map((l) => {
          const mastered = l.items.filter((it) => items[it.id] && isMastered(items[it.id])).length;
          return (
            <Link key={l.id} to={`/lesson/${l.id}`}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex flex-col gap-1">
              <div className="text-2xl">{l.emoji}</div>
              <div className="font-semibold text-sm">{l.title}</div>
              <div className="text-xs text-neutral-400">{mastered}/{l.items.length} maîtrisés</div>
            </Link>
          );
        })}
      </div>
      <section className="space-y-2">
        <h2 className="font-semibold text-sm">Rappel</h2>
        <ReminderButton />
      </section>
    </div>
  );
}
