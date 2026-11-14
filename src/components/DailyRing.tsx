const R = 22;
const C = 2 * Math.PI * R;

export function DailyRing({ count, goal }: { count: number; goal: number }) {
  const ratio = goal > 0 ? Math.min(count / goal, 1) : 0;
  const reached = goal > 0 && count >= goal;
  const label = `Objectif du jour : ${count} sur ${goal}${reached ? " (atteint)" : ""}`;
  return (
    <div className="relative w-14 h-14 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={R} fill="none" strokeWidth="5" className="stroke-neutral-200" />
        <circle
          cx="28" cy="28" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
          className="stroke-accent"
          strokeDasharray={`${ratio * C} ${C}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" aria-hidden="true">
        {reached ? "🎉" : `${count}/${goal}`}
      </div>
    </div>
  );
}
