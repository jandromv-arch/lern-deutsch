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
  });
  it("pads single-digit hours and minutes", () => {
    expect(buildDailyReminderICS(7, 5)).toMatch(/DTSTART[^:]*:\d{8}T070500/);
  });
});
