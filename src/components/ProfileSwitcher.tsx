import { useState } from "react";
import { useAccount } from "../store/useAccount";
import { LANGUAGES, getLanguage } from "../content/languages";
import { Onboarding } from "../screens/Onboarding";

export function ProfileSwitcher() {
  const profiles = useAccount((s) => s.profiles);
  const activeId = useAccount((s) => s.activeId);
  const setActive = useAccount((s) => s.setActive);
  const setLang = useAccount((s) => s.setLang);
  const [creating, setCreating] = useState(false);
  const active = profiles.find((p) => p.id === activeId);

  if (creating) return <Onboarding onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />;
  if (!active) return null;

  const btn = "px-3 py-2 rounded-xl text-sm ";
  return (
    <section className="space-y-3 p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
      <h2 className="font-semibold">Profil</h2>
      <div className="font-bold">{getLanguage(active.lang).flag} {active.name}</div>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <button key={l.id} onClick={() => setLang(active.id, l.id)}
            className={btn + (l.id === active.lang ? "bg-accent text-white" : "bg-neutral-200 dark:bg-neutral-700")}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>
      {profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {profiles.filter((p) => p.id !== active.id).map((p) => (
            <button key={p.id} onClick={() => setActive(p.id)} className={btn + "bg-neutral-200 dark:bg-neutral-700"}>
              {getLanguage(p.lang).flag} {p.name}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setCreating(true)} className={btn + "border border-dashed border-neutral-400"}>＋ Nouveau profil</button>
    </section>
  );
}
