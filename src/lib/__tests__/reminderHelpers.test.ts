import {
  parseItemReminder,
  isReminderSchedulable,
  defaultReminderDraft,
  nextDateForWeekday,
  truncateNotificationBody,
  notificationContent,
  reminderNotificationId,
  isReminderNotificationId,
  buildReminderTrigger,
  formatReminderOptionsPrimary,
  showsReminderCalendar,
  applyReminderRepetition,
  formatMonthYearLabel,
} from "../reminderHelpers";

describe("parseItemReminder", () => {
  it("returns null for missing/invalid", () => {
    expect(parseItemReminder(undefined)).toBeNull();
    expect(parseItemReminder({ kind: "monthly" })).toBeNull();
  });
  it("parses once with Timestamp-like { toDate }", () => {
    const at = new Date("2026-08-01T18:00:00");
    expect(
      parseItemReminder({ kind: "once", at: { toDate: () => at } })
    ).toEqual({ kind: "once", at });
  });
  it("parses daily and weekly", () => {
    expect(parseItemReminder({ kind: "daily", hour: 9, minute: 0 })).toEqual({
      kind: "daily",
      hour: 9,
      minute: 0,
    });
    expect(
      parseItemReminder({ kind: "weekly", weekday: 2, hour: 9, minute: 0 })
    ).toEqual({ kind: "weekly", weekday: 2, hour: 9, minute: 0 });
  });
  it("rejects out-of-range hour/weekday", () => {
    expect(parseItemReminder({ kind: "daily", hour: 24, minute: 0 })).toBeNull();
    expect(
      parseItemReminder({ kind: "weekly", weekday: 0, hour: 9, minute: 0 })
    ).toBeNull();
  });
});

describe("isReminderSchedulable", () => {
  it("false for past once", () => {
    expect(
      isReminderSchedulable(
        { kind: "once", at: new Date("2020-01-01") },
        new Date("2026-01-01")
      )
    ).toBe(false);
  });
  it("true for future once; false at the exact instant", () => {
    const now = new Date("2026-01-01T12:00:00");
    expect(
      isReminderSchedulable({ kind: "once", at: now }, now)
    ).toBe(false);
    expect(
      isReminderSchedulable(
        { kind: "once", at: new Date("2026-01-01T12:00:01") },
        now
      )
    ).toBe(true);
  });
});

describe("defaultReminderDraft", () => {
  it("uses next full hour; rolls to tomorrow if needed", () => {
    const now = new Date("2026-07-29T14:20:00");
    const draft = defaultReminderDraft(now);
    expect(draft.kind).toBe("once");
    if (draft.kind === "once") {
      expect(draft.at.getHours()).toBe(15);
      expect(draft.at.getMinutes()).toBe(0);
      expect(draft.at.getDate()).toBe(29);
    }
  });
});

describe("nextDateForWeekday", () => {
  it("returns upcoming date for Expo weekday 2 (Monday)", () => {
    // 2026-07-29 is Wednesday (js 3). Next Monday = Aug 3.
    const d = nextDateForWeekday(2, new Date("2026-07-29T10:00:00"));
    expect(d.getDay()).toBe(1);
  });
});

describe("notification helpers", () => {
  it("truncates at 120 with ellipsis", () => {
    const s = "x".repeat(130);
    const out = truncateNotificationBody(s);
    expect(out.length).toBe(120);
    expect(out.endsWith("…")).toBe(true);
  });
  it("builds content A fallbacks", () => {
    expect(notificationContent({ title: "  ", body: "" })).toEqual({
      title: "Lembrete",
      body: "Abrir no ThinkDo",
    });
  });
  it("id prefix", () => {
    expect(reminderNotificationId("abc")).toBe("reminder:abc");
    expect(isReminderNotificationId("reminder:abc")).toBe(true);
    expect(isReminderNotificationId("reminder:")).toBe(true);
    expect(isReminderNotificationId("other:abc")).toBe(false);
    expect(isReminderNotificationId("remind:abc")).toBe(false);
  });
});

describe("buildReminderTrigger", () => {
  it("maps kinds", () => {
    const at = new Date("2026-08-01T18:00:00");
    expect(buildReminderTrigger({ kind: "once", at })).toEqual({
      type: "date",
      date: at,
    });
    expect(buildReminderTrigger({ kind: "daily", hour: 9, minute: 30 })).toEqual({
      type: "daily",
      hour: 9,
      minute: 30,
    });
    expect(
      buildReminderTrigger({ kind: "weekly", weekday: 2, hour: 9, minute: 0 })
    ).toEqual({ type: "weekly", weekday: 2, hour: 9, minute: 0 });
  });
});

describe("formatReminderOptionsPrimary", () => {
  it("formats once with date and time", () => {
    const at = new Date(2026, 7, 9, 9, 0, 0); // Aug 9 2026 09:00 local
    const s = formatReminderOptionsPrimary({ kind: "once", at });
    expect(s).toContain("09:00");
    expect(s).toMatch(/9/);
    expect(s).toContain("·");
  });

  it("formats daily as time only", () => {
    expect(
      formatReminderOptionsPrimary({ kind: "daily", hour: 9, minute: 0 })
    ).toBe("Todos os dias · 09:00");
  });

  it("formats weekly as weekday · time", () => {
    expect(
      formatReminderOptionsPrimary({
        kind: "weekly",
        weekday: 2,
        hour: 9,
        minute: 0,
      })
    ).toBe("Toda segunda · 09:00");
  });
});

describe("formatMonthYearLabel", () => {
  it("capitalizes only the first letter", () => {
    const label = formatMonthYearLabel(new Date(2026, 7, 14));
    expect(label.startsWith("Agosto")).toBe(true);
    expect(label).toMatch(/de 2026/i);
    expect(label).not.toMatch(/\bDe\b/);
  });
});

describe("showsReminderCalendar", () => {
  it("hides for daily only", () => {
    expect(showsReminderCalendar("daily")).toBe(false);
    expect(showsReminderCalendar("once")).toBe(true);
    expect(showsReminderCalendar("weekly")).toBe(true);
  });
});

describe("applyReminderRepetition", () => {
  it("daily keeps hour/minute from once", () => {
    const at = new Date(2026, 7, 9, 14, 30);
    expect(
      applyReminderRepetition({ kind: "once", at }, "daily")
    ).toEqual({ kind: "daily", hour: 14, minute: 30 });
  });

  it("weekly takes weekday from once date", () => {
    const at = new Date(2026, 7, 9, 9, 0); // Sunday
    expect(
      applyReminderRepetition({ kind: "once", at }, "weekly")
    ).toEqual({ kind: "weekly", weekday: 1, hour: 9, minute: 0 });
  });

  it("rolls a past daily time to tomorrow when switching to once", () => {
    const now = new Date(2026, 7, 9, 14, 30);
    const result = applyReminderRepetition(
      { kind: "daily", hour: 9, minute: 15 },
      "once",
      now
    );

    expect(result).toEqual({
      kind: "once",
      at: new Date(2026, 7, 10, 9, 15),
    });
  });

  it("keeps a future daily time today when switching to once", () => {
    const now = new Date(2026, 7, 9, 14, 30);
    const result = applyReminderRepetition(
      { kind: "daily", hour: 18, minute: 45 },
      "once",
      now
    );

    expect(result).toEqual({
      kind: "once",
      at: new Date(2026, 7, 9, 18, 45),
    });
  });
});
