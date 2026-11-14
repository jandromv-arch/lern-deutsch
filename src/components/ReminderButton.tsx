import { useProgress } from "../store/useProgress";
import { buildDailyReminderICS } from "../engine/ics";

export function ReminderButton() {
  const { reminderTime, setReminderTime } = useProgress();

  function download() {
    const [h, m] = (reminderTime || "19:00").split(":").map(Number);
    const ics = buildDailyReminderICS(Number.isFinite(h) ? h : 19, Number.isFinite(m) ? m : 0);
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "lern-deutsch-rappel.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="reminder-time" className="font-semibold text-sm">Heure du rappel</label>
        <input
          id="reminder-time"
          type="time"
          value={reminderTime || "19:00"}
          onChange={(e) => e.target.value && setReminderTime(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1"
        />
      </div>
      <button onClick={download} className="w-full py-2 rounded-xl bg-accent text-white font-semibold">
        Ajouter un rappel quotidien 🔔
      </button>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Ajoute un rappel dans ton Calendrier</p>
    </div>
  );
}
