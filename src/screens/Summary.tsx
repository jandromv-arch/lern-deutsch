import { Link } from "react-router-dom";
import type { SessionStats } from "./SessionRunner";
import { useProgress } from "../store/useProgress";
import { isMastered } from "../engine/leitner";

export function Summary({ stats, nextTo, itemIds }: { stats: SessionStats; nextTo: string; itemIds: string[] }) {
  const items = useProgress((s) => s.items);
  const mastered = itemIds.filter((id) => items[id] && isMastered(items[id])).length;
  return (
    <div className="p-8 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold">Terminé !</h2>
      <p className="text-neutral-600">{stats.correct} / {stats.total} corrects</p>
      <p className="text-accent font-semibold">+{stats.xpGained} XP</p>
      <p className="text-neutral-600">mots maîtrisés : {mastered}</p>
      <div className="flex gap-3 justify-center mt-4">
        <Link to={nextTo} className="inline-block px-6 py-3 rounded-xl bg-accent text-white">Continuer</Link>
        <Link to="/review" className="inline-block px-6 py-3 rounded-xl border border-accent text-accent">Réviser</Link>
      </div>
    </div>
  );
}
