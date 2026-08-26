import type { ItemReminder, ReminderWeekday } from "../types/item";

export type ReminderTrigger =
  | { type: "date"; date: Date }
  | { type: "daily"; hour: number; minute: number }
  | { type: "weekly"; weekday: ReminderWeekday; hour: number; minute: number };

const WEEKDAY_PT: Record<ReminderWeekday, string> = {
  1: "dom",
  2: "seg",
  3: "ter",
  4: "qua",
  5: "qui",
  6: "sex",
  7: "sáb",
};

function isHourMinute(hour: unknown, minute: unknown): boolean {
  return (
    typeof hour === "number" &&
    Number.isInteger(hour) &&
    hour >= 0 &&
    hour <= 23 &&
    typeof minute === "number" &&
    Number.isInteger(minute) &&
    minute >= 0 &&
    minute <= 59
  );
}

function isReminderWeekday(value: unknown): value is ReminderWeekday {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 7
  );
}

function parseOnceAt(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    const d = (value as { toDate: () => Date }).toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  return null;
}

export function parseItemReminder(value: unknown): ItemReminder | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (r.kind === "once") {
    const at = parseOnceAt(r.at);
    return at ? { kind: "once", at } : null;
  }
  if (r.kind === "daily") {
    if (!isHourMinute(r.hour, r.minute)) return null;
    return { kind: "daily", hour: r.hour as number, minute: r.minute as number };
  }
  if (r.kind === "weekly") {
    if (!isReminderWeekday(r.weekday) || !isHourMinute(r.hour, r.minute)) {
      return null;
    }
    return {
      kind: "weekly",
      weekday: r.weekday,
      hour: r.hour as number,
      minute: r.minute as number,
    };
  }
  return null;
}

export function isReminderSchedulable(
  reminder: ItemReminder,
  now: Date = new Date()
): boolean {
  if (reminder.kind === "once") return reminder.at.getTime() > now.getTime();
  return true;
}

export function defaultReminderDraft(now: Date = new Date()): ItemReminder {
  const at = new Date(now);
  at.setSeconds(0, 0);
  at.setMinutes(0);
  at.setHours(at.getHours() + 1);
  return { kind: "once", at };
}

/** JS Date#getDay() 0–6 (Sun–Sat) → Expo weekday 1–7 */
export function jsWeekdayToReminderWeekday(jsDay: number): ReminderWeekday {
  return ((jsDay % 7) + 1) as ReminderWeekday;
}

export function reminderWeekdayFromDate(date: Date): ReminderWeekday {
  return jsWeekdayToReminderWeekday(date.getDay());
}

/** Next calendar date whose Expo weekday matches (today if already that day). */
export function nextDateForWeekday(
  weekday: ReminderWeekday,
  now: Date = new Date()
): Date {
  const targetJs = weekday - 1; // 0–6
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const delta = (targetJs - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta);
  return d;
}

export function truncateNotificationBody(
  body: string,
  max: number = 120
): string {
  if (body.length <= max) return body;
  if (max <= 1) return "…".slice(0, max);
  return body.slice(0, max - 1) + "…";
}

export function notificationContent(item: {
  title: string;
  body: string;
}): { title: string; body: string } {
  const title = item.title.trim() || "Lembrete";
  const trimmedBody = item.body.trim();
  const body = trimmedBody
    ? truncateNotificationBody(trimmedBody)
    : "Abrir no ThinkDo";
  return { title, body };
}

export function reminderNotificationId(itemId: string): string {
  return `reminder:${itemId}`;
}

export function isReminderNotificationId(id: string): boolean {
  return id.startsWith("reminder:");
}

export function repetitionLabel(kind: ItemReminder["kind"]): string {
  if (kind === "once") return "Nunca";
  if (kind === "daily") return "Diário";
  return "Semanal";
}

export function weekdayLabelPt(weekday: ReminderWeekday): string {
  return WEEKDAY_PT[weekday];
}

/** "agosto de 2026" → "Agosto de 2026" (não capitaliza o "de"). */
export function formatMonthYearLabel(date: Date): string {
  const raw = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  if (!raw) return raw;
  return raw.charAt(0).toLocaleUpperCase("pt-BR") + raw.slice(1);
}

const WEEKDAY_FULL_PT: Record<ReminderWeekday, string> = {
  1: "domingo",
  2: "segunda",
  3: "terça",
  4: "quarta",
  5: "quinta",
  6: "sexta",
  7: "sábado",
};

export function weekdayFullLabelPt(weekday: ReminderWeekday): string {
  return WEEKDAY_FULL_PT[weekday];
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function timeHm(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

export function formatReminderOptionsPrimary(reminder: ItemReminder): string {
  if (reminder.kind === "once") {
    const datePart = reminder.at.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `${datePart} · ${timeHm(reminder.at.getHours(), reminder.at.getMinutes())}`;
  }
  if (reminder.kind === "daily") {
    return `Todos os dias · ${timeHm(reminder.hour, reminder.minute)}`;
  }
  return `Toda ${weekdayFullLabelPt(reminder.weekday)} · ${timeHm(reminder.hour, reminder.minute)}`;
}

export function showsReminderCalendar(kind: ItemReminder["kind"]): boolean {
  return kind !== "daily";
}

function combineDateAndTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function applyReminderRepetition(
  current: ItemReminder,
  kind: ItemReminder["kind"],
  now: Date = new Date()
): ItemReminder {
  const hour =
    current.kind === "once" ? current.at.getHours() : current.hour;
  const minute =
    current.kind === "once" ? current.at.getMinutes() : current.minute;

  if (kind === "daily") {
    return { kind: "daily", hour, minute };
  }
  if (kind === "weekly") {
    const base =
      current.kind === "once"
        ? current.at
        : current.kind === "weekly"
          ? nextDateForWeekday(current.weekday, now)
          : nextDateForWeekday(reminderWeekdayFromDate(now), now);
    return {
      kind: "weekly",
      weekday: reminderWeekdayFromDate(base),
      hour,
      minute,
    };
  }
  const draft = defaultReminderDraft(now);
  if (draft.kind !== "once") return draft;
  const at = combineDateAndTime(draft.at, hour, minute);
  if (at.getTime() <= now.getTime()) {
    at.setDate(at.getDate() + 1);
  }
  return { kind: "once", at };
}

export function buildReminderTrigger(reminder: ItemReminder): ReminderTrigger {
  if (reminder.kind === "once") {
    return { type: "date", date: reminder.at };
  }
  if (reminder.kind === "daily") {
    return { type: "daily", hour: reminder.hour, minute: reminder.minute };
  }
  return {
    type: "weekly",
    weekday: reminder.weekday,
    hour: reminder.hour,
    minute: reminder.minute,
  };
}

export function reminderToFirestore(
  reminder: ItemReminder | null
): ItemReminder | null {
  return reminder;
}
