import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildFill } from "../engine/exercises";

export function FillBlank({ item, pool, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const f = useMemo(() => buildFill(item, pool), [item, pool]);
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    onResult(opt === f.answer);
  };
  return (
    <div className="p-6 space-y-4">
      <div className="text-xl text-center">
        {f.sentenceParts[0]}
        <span className="px-2 border-b-2 border-accent">{chosen ?? "____"}</span>
        {f.sentenceParts[1]}
      </div>
      <div className="text-sm text-neutral-500 text-center">{item.fr}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {f.options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)}
            className={`px-4 py-2 rounded-xl border ${chosen && opt === f.answer ? "bg-good text-white" : chosen === opt ? "bg-bad text-white" : "bg-white dark:bg-neutral-800 dark:border-neutral-700"}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
