import { levelFromXp } from "../engine/xp";

export function LevelBar({ xp }: { xp: number }) {
  const lvl = levelFromXp(xp);
  const pct = Math.round((lvl.xpInto / lvl.xpForNext) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-bold">{lvl.label}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-2 bg-neutral-200 rounded">
        <div className="h-2 bg-accent rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
