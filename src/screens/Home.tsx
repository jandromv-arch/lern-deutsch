import { Link } from "react-router-dom";
import { course } from "../content/course";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { LevelBar } from "../components/LevelBar";
import { isMastered } from "../engine/leitner";

export function Home() {
  const { xp, streak, items, dueItemIds } = useProgress();
  const started = Object.keys(items);
  const dueCount = dueItemIds(started, today()).length;
  return (
    <div className="p-4 space-y-5">
      <header className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lern Deutsch 🇩🇪</h1>
          <span className="text-sm">🔥 {streak.count}</span>
        </div>
        <LevelBar xp={xp} />
        {dueCount > 0 && (
          <Link to="/review" className="block text-center py-2 rounded-xl bg-accent/10 text-accent font-semibold">
            {dueCount} mots à réviser aujourd'hui →
          </Link>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3">
        {course.lessons.map((l) => {
          const mastered = l.items.filter((it) => items[it.id] && isMastered(items[it.id])).length;
          return (
            <Link key={l.id} to={`/lesson/${l.id}`}
              className="p-4 rounded-2xl bg-white shadow-sm flex flex-col gap-1">
              <div className="text-2xl">{l.emoji}</div>
              <div className="font-semibold text-sm">{l.title}</div>
              <div className="text-xs text-neutral-400">{mastered}/{l.items.length} maîtrisés</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
