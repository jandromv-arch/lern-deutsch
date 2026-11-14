import { Link } from "react-router-dom";
import { dialogues } from "../content/dialogues";

export function Dialogue() {
  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dialogues 💬</h1>
        <Link to="/" className="text-sm text-accent">← Accueil</Link>
      </header>
      <div className="space-y-3">
        {dialogues.map((d) => (
          <Link key={d.id} to={`/dialogues/${d.id}`}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{d.emoji}</span>
            <span className="font-semibold">{d.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
