import { describe, it, expect } from "vitest";
import { buildDailyReminderICS } from "./ics";

describe("ics", () => {
  it("builds a daily recurring reminder with an alarm at the given time", () => {
    const ics = buildDailyReminderICS(19, 0);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("RRULE:FREQ=DAILY");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toMatch(/DTSTART[^:]*:\d{8}T190000/);
    expect(ics).not.toMatch(/DTSTART[^\r\n]*Z/);
    expect(ics).toContain("UID:");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("\r\n");
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("SUMMARY:");
    expect(ics).toContain("END:VALARM");
  });
  it("DTSTART uses today's local date", () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const today = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    expect(buildDailyReminderICS(19, 0)).toContain(`DTSTART:${today}T190000`);
  });
  it("pads single-digit hours and minutes", () => {
    expect(buildDailyReminderICS(7, 5)).toMatch(/DTSTART[^:]*:\d{8}T070500/);
  });
});
