import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildQcm } from "../engine/exercises";
import { AudioButton } from "./AudioButton";

export function Qcm({ item, pool, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const q = useMemo(() => buildQcm(item, pool), [item, pool]);
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    onResult(opt === q.answer);
  };
  return (
    <div className="p-6 space-y-4">
      <div className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
        <span>{q.prompt}</span>
        <AudioButton text={q.prompt} />
      </div>
      <div className="grid gap-3">
        {q.options.map((opt) => {
          const state = chosen && (opt === q.answer ? "bg-good text-white" : opt === chosen ? "bg-bad text-white" : "bg-white");
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={`py-3 rounded-xl border ${state || "bg-white"}`}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
