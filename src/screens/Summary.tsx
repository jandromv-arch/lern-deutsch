import { Link } from "react-router-dom";
import type { SessionStats } from "./SessionRunner";

export function Summary({ stats, nextTo }: { stats: SessionStats; nextTo: string }) {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold">Terminé !</h2>
      <p className="text-neutral-600">{stats.correct} / {stats.total} corrects</p>
      <p className="text-accent font-semibold">+{stats.correct * 10} XP</p>
      <Link to={nextTo} className="inline-block mt-4 px-6 py-3 rounded-xl bg-accent text-white">Continuer</Link>
    </div>
  );
}
