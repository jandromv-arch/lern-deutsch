import { Link } from "react-router-dom";
import { course } from "../content/course";
import { GrammarTip } from "../components/GrammarTip";

const LEVELS = ["A1", "A2", "B1"] as const;

export function Grammar() {
  const withTips = course.lessons.filter((l) => l.grammarTip);
  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Grammaire 📚</h1>
        <Link to="/" className="text-sm text-accent">← Accueil</Link>
      </header>
      {LEVELS.map((lv) => {
        const tips = withTips.filter((l) => l.level === lv);
        if (tips.length === 0) return null;
        return (
          <section key={lv} className="space-y-3">
            <h2 className="font-bold text-lg">{lv}</h2>
            {tips.map((l) => (
              <GrammarTip key={l.id} tip={l.grammarTip!} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
