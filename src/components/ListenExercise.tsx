import { useEffect, useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildListen } from "../engine/exercises";
import { playAudio } from "../engine/audio";

export function ListenExercise({ item, pool, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const q = useMemo(() => buildListen(item, pool), [item, pool]);
  const [chosen, setChosen] = useState<string | null>(null);

  // Best-effort autoplay: iOS may block it until a user gesture.
  useEffect(() => {
    try { playAudio(q.audioText); } catch { /* blocked: user taps the button */ }
  }, [q.audioText]);

  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    onResult(opt === q.answer);
  };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">Qu'as-tu entendu ?</h2>
      <div className="flex items-center justify-center gap-3">
        <button type="button" aria-label="Écouter" onClick={() => playAudio(q.audioText)}
          className="text-4xl w-20 h-20 rounded-full bg-white dark:bg-neutral-800 border dark:border-neutral-700 shadow">🔊</button>
        <button type="button" aria-label="Écouter lentement" onClick={() => playAudio(q.audioText, { slow: true })}
          className="text-2xl w-12 h-12 rounded-full bg-white dark:bg-neutral-800 border dark:border-neutral-700">🐢</button>
      </div>
      {chosen && <div className="text-center text-lg font-medium">{q.audioText}</div>}
      <div className="grid gap-3">
        {q.options.map((opt) => {
          const state = chosen && (opt === q.answer ? "bg-good text-white" : opt === chosen ? "bg-bad text-white" : "");
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={`py-3 rounded-xl border ${state || "bg-white dark:bg-neutral-800 dark:border-neutral-700"}`}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
