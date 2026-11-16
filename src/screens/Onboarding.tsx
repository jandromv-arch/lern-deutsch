import { useState } from "react";
import { LANGUAGES } from "../content/languages";
import type { Level } from "../content/types";
import { useAccount } from "../store/useAccount";

const LEVELS: { id: Level; label: string }[] = [
  { id: "A1", label: "A1 · Débutant" },
  { id: "A2", label: "A2 · Intermédiaire" },
  { id: "B1", label: "B1 · Avancé" },
];

const card = "w-full p-4 rounded-xl text-left shadow-sm border-2 ";
const idle = "bg-white dark:bg-neutral-800 border-transparent";
const sel = "bg-white dark:bg-neutral-800 border-accent";
const primary = "w-full py-3 rounded-xl bg-accent text-white font-semibold disabled:opacity-40";

export function Onboarding({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [lang, setLang] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);

  const finish = () => {
    if (!lang || !level) return;
    useAccount.getState().createProfile(name.trim(), lang, level);
    onDone?.();
  };

  return (
    <div className="min-h-screen p-6 flex flex-col justify-center gap-4 max-w-md mx-auto">
      {step === 0 && (
        <>
          <h1 className="text-xl font-bold">Comment tu t'appelles ?</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
            className="w-full p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
          />
          <button className={primary} disabled={!name.trim()} onClick={() => setStep(1)}>Suivant</button>
        </>
      )}
      {step === 1 && (
        <>
          <h1 className="text-xl font-bold">Quelle langue veux-tu apprendre ?</h1>
          {LANGUAGES.map((l) => (
            <button key={l.id} className={card + (lang === l.id ? sel : idle)} onClick={() => setLang(l.id)}>
              <span className="text-2xl mr-2">{l.flag}</span>
              <span className="font-semibold">{l.label}</span>
            </button>
          ))}
          <button className={primary} disabled={!lang} onClick={() => setStep(2)}>Suivant</button>
        </>
      )}
      {step === 2 && (
        <>
          <h1 className="text-xl font-bold">Ton niveau ?</h1>
          {LEVELS.map((l) => (
            <button key={l.id} className={card + (level === l.id ? sel : idle)} onClick={() => setLevel(l.id)}>
              {l.label}
            </button>
          ))}
          <button className={primary} disabled={!level} onClick={finish}>Commencer</button>
        </>
      )}
      {step > 0 ? (
        <button className="text-sm text-neutral-400" onClick={() => setStep(step - 1)}>← Retour</button>
      ) : onCancel ? (
        <button className="text-sm text-neutral-400" onClick={onCancel}>Annuler</button>
      ) : null}
    </div>
  );
}
