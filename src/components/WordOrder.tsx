import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildOrder } from "../engine/exercises";

export function WordOrder({ item, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const o = useMemo(() => buildOrder(item), [item]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(o.tiles);
  const take = (i: number) => {
    setAnswer([...answer, bank[i]]);
    setBank(bank.filter((_, j) => j !== i));
  };
  const check = () => onResult(answer.join(" ") === o.solution.join(" "));
  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-neutral-500 text-center">{o.promptFr}</div>
      <div className="min-h-12 flex flex-wrap gap-2 justify-center border-b dark:border-neutral-700 pb-2">
        {answer.map((w, i) => <span key={i} className="px-3 py-1 rounded-lg bg-accent text-white">{w}</span>)}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((w, i) => <button key={i} onClick={() => take(i)} className="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border dark:border-neutral-700">{w}</button>)}
      </div>
      <button onClick={check} disabled={bank.length > 0}
        className="w-full py-3 rounded-xl bg-accent text-white disabled:opacity-40">Vérifier</button>
    </div>
  );
}
