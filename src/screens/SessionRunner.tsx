import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Step } from "../engine/session";
import type { VocabItem } from "../content/types";
import { buildFill } from "../engine/exercises";
import { useProgress } from "../store/useProgress";
import { playCorrect, playWrong } from "../engine/sfx";
import { today } from "../app/today";
import { Flashcard } from "../components/Flashcard";
import { Qcm } from "../components/Qcm";
import { FillBlank } from "../components/FillBlank";
import { WordOrder } from "../components/WordOrder";

export interface SessionStats { correct: number; total: number; xpGained: number }

const COMP = { flashcard: Flashcard, qcm: Qcm, fill: FillBlank, order: WordOrder };

export function SessionRunner({ steps, itemsById, pool, onDone }: {
  steps: Step[];
  itemsById: Record<string, VocabItem>;
  pool: VocabItem[];
  onDone: (s: SessionStats) => void;
}) {
  const addAnswer = useProgress((s) => s.addAnswer);
  const recordItem = useProgress((s) => s.recordItem);
  const startSession = useProgress((s) => s.startSession);
  const [i, setI] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const startXp = useRef(useProgress.getState().xp);
  const itemCorrect = useRef<Record<string, boolean>>({});
  const [flash, setFlash] = useState<null | boolean>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { startSession(); }, [startSession]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (i >= steps.length) return null;
  const step = steps[i];
  const item = itemsById[step.itemId];
  // A fill step with no usable blank in its example falls back to a real QCM.
  const Comp = step.type === "fill" && !buildFill(item, pool).ok ? Qcm : COMP[step.type];

  const handle = (correct: boolean) => {
    if (timer.current) return; // ignore input during the feedback window
    const day = today();
    addAnswer(correct, day);
    itemCorrect.current[step.itemId] = (itemCorrect.current[step.itemId] ?? true) && correct;
    // SRS is advanced once per item per session, on that item's last step.
    if (steps[i + 1]?.itemId !== step.itemId) {
      recordItem(step.itemId, itemCorrect.current[step.itemId], day);
    }
    const next = { correct: stats.correct + (correct ? 1 : 0), total: stats.total + 1 };
    setStats(next);
    setFlash(correct);
    if (useProgress.getState().soundOn) {
      if (correct) playCorrect();
      else playWrong();
    }
    if (navigator.vibrate) navigator.vibrate(correct ? 20 : [10, 30, 10]);
    timer.current = setTimeout(() => {
      timer.current = null;
      setFlash(null);
      if (i + 1 >= steps.length) onDone({ ...next, xpGained: useProgress.getState().xp - startXp.current });
      else setI(i + 1);
    }, 500);
  };

  return (
    <div className="relative">
      <div className="h-1 bg-neutral-200">
        <div className="h-1 bg-accent transition-all" style={{ width: `${(i / steps.length) * 100}%` }} />
      </div>
      {flash !== null && (
        <motion.div
          data-testid="feedback-flash"
          className={`absolute inset-0 pointer-events-none ${flash ? "bg-good/20" : "bg-bad/20"}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <Comp key={`${i}-${step.itemId}-${step.type}`} item={item} pool={pool} onResult={handle} />
    </div>
  );
}
