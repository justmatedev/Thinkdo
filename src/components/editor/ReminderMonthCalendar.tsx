import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatMonthYearLabel,
  reminderWeekdayFromDate,
  weekdayFullLabelPt,
} from "../../lib/reminderHelpers";
import { font, fontSize, spacing, touchTarget } from "../../lib/theme";
import { useTheme } from "../../lib/themeContext";
import type { ReminderWeekday } from "../../types/item";

type Props = {
  selected: Date;
  onSelectDate: (date: Date) => void;
  disablePastDays?: boolean;
  /** When set (weekly mode), highlight every matching weekday in the month. */
  highlightWeekday?: ReminderWeekday;
};

const DOW = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDay(day: Date, now: Date): boolean {
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < now.getTime();
}

export function ReminderMonthCalendar({
  selected,
  onSelectDate,
  disablePastDays = false,
  highlightWeekday,
}: Props) {
  const { colors } = useTheme();
  const selectedMonth = startOfMonth(selected);
  const selectedMonthKey = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
  const [visibleMonth, setVisibleMonth] = useState(selectedMonth);
  const [syncedMonthKey, setSyncedMonthKey] = useState(selectedMonthKey);
  const now = useMemo(() => new Date(), []);

  if (selectedMonthKey !== syncedMonthKey) {
    setSyncedMonthKey(selectedMonthKey);
    setVisibleMonth(selectedMonth);
  }

  const cells = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const startPad = first.getDay(); // 0 Sun
    const daysInMonth = new Date(
      first.getFullYear(),
      first.getMonth() + 1,
      0
    ).getDate();
    const out: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startPad - i));
      out.push({ date: d, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      out.push({
        date: new Date(first.getFullYear(), first.getMonth(), day),
        inMonth: true,
      });
    }
    while (out.length % 7 !== 0) {
      const last = out[out.length - 1]!.date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      out.push({ date: d, inMonth: false });
    }
    return out;
  }, [visibleMonth]);

  const monthLabel = formatMonthYearLabel(visibleMonth);
  const weeklyHint =
    highlightWeekday != null
      ? `Repete toda ${weekdayFullLabelPt(highlightWeekday)}`
      : null;

  return (
    <View style={styles.root}>
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          onPress={() =>
            setVisibleMonth(
              new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
            )
          }
          style={styles.nav}
        >
          <Text style={{ color: colors.textPrimary, fontFamily: font.medium }}>‹</Text>
        </Pressable>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: font.semibold,
            fontSize: fontSize.body,
          }}
        >
          {monthLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          onPress={() =>
            setVisibleMonth(
              new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
            )
          }
          style={styles.nav}
        >
          <Text style={{ color: colors.textPrimary, fontFamily: font.medium }}>›</Text>
        </Pressable>
      </View>
      {weeklyHint ? (
        <Text
          style={{
            textAlign: "center",
            color: colors.textSecondary,
            fontFamily: font.medium,
            fontSize: fontSize.meta,
          }}
        >
          {weeklyHint}
        </Text>
      ) : null}
      <View style={styles.grid}>
        {DOW.map((d, i) => (
          <Text
            key={`${d}-${i}`}
            style={[styles.dow, { color: colors.textSecondary }]}
          >
            {d}
          </Text>
        ))}
        {cells.map((cell, i) => {
          const selectedDay = sameDay(cell.date, selected);
          const weekdayMatch =
            highlightWeekday != null &&
            cell.inMonth &&
            reminderWeekdayFromDate(cell.date) === highlightWeekday;
          const disabled =
            disablePastDays && isPastDay(cell.date, now) && !selectedDay;
          const accessibilityLabel = cell.date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{ selected: selectedDay || weekdayMatch }}
              disabled={disabled || !cell.inMonth}
              onPress={() => onSelectDate(cell.date)}
              style={styles.cell}
            >
              <View
                style={[
                  styles.dayMark,
                  weekdayMatch &&
                    !selectedDay && {
                      backgroundColor: colors.accentSubtle,
                      borderRadius: 18,
                    },
                  selectedDay && {
                    backgroundColor: colors.action,
                    borderRadius: 18,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: selectedDay
                        ? colors.textInverse
                        : weekdayMatch
                          ? colors.action
                          : !cell.inMonth || disabled
                            ? colors.textSecondary
                            : colors.textPrimary,
                      opacity: !cell.inMonth || disabled ? 0.35 : 1,
                    },
                  ]}
                >
                  {cell.date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: touchTarget,
  },
  nav: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dow: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontFamily: font.medium,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontFamily: font.medium,
    fontSize: fontSize.meta,
    lineHeight: fontSize.meta,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
