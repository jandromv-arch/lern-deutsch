import { useEffect, useRef, useState } from "react";
import type { Step } from "../engine/session";
import type { VocabItem } from "../content/types";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { Flashcard } from "../components/Flashcard";
import { Qcm } from "../components/Qcm";
import { FillBlank } from "../components/FillBlank";
import { WordOrder } from "../components/WordOrder";

export interface SessionStats { correct: number; total: number }

const COMP = { flashcard: Flashcard, qcm: Qcm, fill: FillBlank, order: WordOrder };

export function SessionRunner({ steps, itemsById, pool, onDone }: {
  steps: Step[];
  itemsById: Record<string, VocabItem>;
  pool: VocabItem[];
  onDone: (s: SessionStats) => void;
}) {
  const record = useProgress((s) => s.recordAnswer);
  const [i, setI] = useState(0);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, total: 0 });
  const [flash, setFlash] = useState<null | boolean>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (i >= steps.length) return null;
  const step = steps[i];
  const item = itemsById[step.itemId];
  const Comp = COMP[step.type];

  const handle = (correct: boolean) => {
    if (timer.current) return; // ignore input during the feedback window
    record(step.itemId, correct, today());
    const next = { correct: stats.correct + (correct ? 1 : 0), total: stats.total + 1 };
    setStats(next);
    setFlash(correct);
    if (navigator.vibrate) navigator.vibrate(correct ? 20 : [10, 30, 10]);
    timer.current = setTimeout(() => {
      timer.current = null;
      setFlash(null);
      if (i + 1 >= steps.length) onDone(next);
      else setI(i + 1);
    }, 500);
  };

  return (
    <div className="relative">
      <div className="h-1 bg-neutral-200">
        <div className="h-1 bg-accent transition-all" style={{ width: `${(i / steps.length) * 100}%` }} />
      </div>
      {flash !== null && (
        <div className={`absolute inset-0 pointer-events-none ${flash ? "bg-good/20" : "bg-bad/20"}`} />
      )}
      <Comp key={`${i}-${step.itemId}-${step.type}`} item={item} pool={pool} onResult={handle} />
    </div>
  );
}
