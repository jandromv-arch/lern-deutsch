import { useEffect, useRef, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildType, checkTyped } from "../engine/exercises";
import { AudioButton } from "./AudioButton";

export function TypeInput({ item, onResult }: { item: VocabItem; pool?: VocabItem[]; onResult: (c: boolean) => void }) {
  const t = buildType(item);
  const [value, setValue] = useState("");
  const [done, setDone] = useState<null | boolean>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const submit = () => {
    if (done !== null) return;
    const ok = checkTyped(value, t.answer);
    setDone(ok);
    timer.current = setTimeout(() => onResult(ok), 600);
  };
  return (
    <div className="p-6 space-y-4 text-center">
      <div className="text-neutral-500 dark:text-neutral-400">{t.promptFr}</div>
      <div className="flex items-center justify-center gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="de"
          readOnly={done !== null}
          className={`border-b-2 bg-transparent text-xl text-center outline-none px-2 py-1 dark:text-neutral-100 ${done === null ? "border-accent" : done ? "border-good text-good" : "border-bad text-bad"}`}
          placeholder="…" aria-label="Réponse en allemand" />
        <AudioButton text={t.answer} />
      </div>
      {done === false && (
        <div className="text-sm dark:text-neutral-100">Réponse : <span className="font-semibold">{t.answer}</span></div>
      )}
      <button onClick={submit} disabled={done !== null}
        className="w-full py-3 rounded-xl bg-accent text-white disabled:opacity-40">Vérifier</button>
    </div>
  );
}
