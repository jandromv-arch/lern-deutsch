import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dialogues } from "../content/dialogues";
import type { Dialogue } from "../content/dialogueTypes";
import type { VocabItem } from "../content/types";
import { AudioButton } from "../components/AudioButton";
import { WordOrder } from "../components/WordOrder";
import { TypeInput } from "../components/TypeInput";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";

export function DialoguePlay() {
  const { id } = useParams();
  const d = dialogues.find((x) => x.id === id);
  if (!d) {
    return (
      <div className="p-6 text-center space-y-3">
        <p>Dialogue introuvable</p>
        <Link to="/dialogues" className="text-accent">← Retour aux dialogues</Link>
      </div>
    );
  }
  return <DialoguePlayView key={d.id} dialogue={d} />;
}

export function DialoguePlayView({ dialogue }: { dialogue: Dialogue }) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  // Snapshot the practice queue once.
  const queue = useMemo<VocabItem[]>(() => {
    const n = dialogue.lines.length;
    const count = Math.min(3, n);
    const picks = Array.from({ length: count }, (_, k) => (count === 1 ? 0 : Math.round((k * (n - 1)) / (count - 1))));
    return picks.map((i) => {
      const line = dialogue.lines[i];
      return { id: `${dialogue.id}-L${i}`, de: line.de, fr: line.fr, gender: null, example: { de: line.de, fr: line.fr } };
    });
  }, [dialogue]);

  const total = dialogue.lines.length;
  const reading = idx < total;

  if (reading) {
    const line = dialogue.lines[idx];
    const right = idx % 2 === 1;
    return (
      <div className="p-4 space-y-4">
        <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden"
          role="progressbar" aria-valuenow={idx + 1} aria-valuemax={total}>
          <div className="h-full bg-accent" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
        <div className="text-xs text-neutral-500 text-center">{idx + 1}/{total}</div>
        <div className={`flex ${right ? "justify-end" : "justify-start"}`}>
          <div className="max-w-[85%] p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm space-y-1">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{line.speaker}</div>
            <div className="flex items-center gap-2 text-lg dark:text-neutral-100">
              <span>{line.de}</span>
              <AudioButton text={line.de} />
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{line.fr}</div>
          </div>
        </div>
        <button onClick={() => setIdx(idx + 1)}
          className="w-full py-3 rounded-xl bg-accent text-white">Suivant</button>
      </div>
    );
  }

  if (step < queue.length) {
    const item = queue[step];
    const onResult = (correct: boolean) => {
      useProgress.getState().addAnswer(correct, today());
      setStep(step + 1);
    };
    return (
      <div>
        <div className="px-4 pt-4 text-sm text-center text-neutral-500">
          Pratique {step + 1}/{queue.length}
        </div>
        {step % 2 === 0
          ? <WordOrder key={`${item.id}-${step}`} item={item} pool={queue} onResult={onResult} />
          : <TypeInput key={`${item.id}-${step}`} item={item} pool={queue} onResult={onResult} />}
      </div>
    );
  }

  return (
    <div className="p-8 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold">Terminé 🎉</h2>
      <Link to="/dialogues" className="inline-block px-6 py-3 rounded-xl bg-accent text-white">
        Retour aux dialogues
      </Link>
    </div>
  );
}
