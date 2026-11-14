const pad = (n: number) => String(n).padStart(2, "0");

/** Daily recurring reminder (floating local time, so it follows the user's timezone). */
export function buildDailyReminderICS(hour: number, minute: number): string {
  const d = new Date();
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const time = `${pad(hour)}${pad(minute)}00`;
  const stamp = `${date}T${time}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lern Deutsch//Rappel//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:lern-deutsch-daily@jandromv-arch",
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    "RRULE:FREQ=DAILY",
    "SUMMARY:Lern Deutsch — leçon du jour",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0S",
    "DESCRIPTION:Lern Deutsch — leçon du jour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
