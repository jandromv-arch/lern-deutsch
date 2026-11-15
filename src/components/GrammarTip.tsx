export function GrammarTip({
  tip,
  onContinue,
}: {
  tip: { title: string; body: string };
  onContinue?: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm space-y-2">
      <div className="font-bold">💡 Astuce : {tip.title}</div>
      <p className="text-sm whitespace-pre-line">{tip.body}</p>
      {onContinue && (
        <button onClick={onContinue} className="w-full p-3 rounded-xl bg-accent text-white font-semibold">
          Continuer
        </button>
      )}
    </div>
  );
}
