import { useProgress } from "../store/useProgress";
import { applyTheme } from "../app/theme";

function prefersDark(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function HeaderControls() {
  const soundOn = useProgress((s) => s.soundOn);
  const setSoundOn = useProgress((s) => s.setSoundOn);
  const themePref = useProgress((s) => s.themePref);
  const setThemePref = useProgress((s) => s.setThemePref);
  const isDark = themePref === "dark" || (themePref === "system" && prefersDark());
  const btn = "w-9 h-9 rounded-full flex items-center justify-center text-lg bg-accent/10";
  return (
    <div className="flex gap-2">
      <button type="button" className={btn} aria-label="Son" aria-pressed={soundOn}
        onClick={() => setSoundOn(!soundOn)}>
        {soundOn ? "🔊" : "🔇"}
      </button>
      <button type="button" className={btn} aria-label="Thème"
        onClick={() => { const next = isDark ? "light" : "dark"; setThemePref(next); applyTheme(next); }}>
        {isDark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
