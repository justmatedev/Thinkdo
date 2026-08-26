import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  applyReminderRepetition,
  isReminderSchedulable,
  repetitionLabel,
} from "../../lib/reminderHelpers";
import { font, fontSize, radius, spacing, touchTarget } from "../../lib/theme";
import { useTheme } from "../../lib/themeContext";
import type { ItemReminder, ReminderWeekday } from "../../types/item";
import { ReminderMonthCalendar } from "./ReminderMonthCalendar";
import { ReminderTimeScroller } from "./ReminderTimeScroller";
import { ReminderWeekdayPicker } from "./ReminderWeekdayPicker";
import { shouldDismissReminderEditor } from "./reminderEditorInteractions";

export type ReminderEditorSheetProps = {
  visible: boolean;
  reminder: ItemReminder;
  onChange: (next: ItemReminder | null) => void;
  onClose: () => void;
};

const REMINDER_KINDS = ["once", "daily", "weekly"] as const;
const REPETITION_OPTIONS = REMINDER_KINDS.map((kind) => ({
  value: kind,
  label: repetitionLabel(kind),
}));

function withDate(reminder: ItemReminder, date: Date): ItemReminder {
  const hour =
    reminder.kind === "once" ? reminder.at.getHours() : reminder.hour;
  const minute =
    reminder.kind === "once" ? reminder.at.getMinutes() : reminder.minute;

  const at = new Date(date);
  at.setHours(hour, minute, 0, 0);
  return { kind: "once", at };
}

function withWeekday(
  reminder: Extract<ItemReminder, { kind: "weekly" }>,
  weekday: ReminderWeekday
): ItemReminder {
  return {
    kind: "weekly",
    weekday,
    hour: reminder.hour,
    minute: reminder.minute,
  };
}

function withTime(
  reminder: ItemReminder,
  hour: number,
  minute: number
): ItemReminder {
  if (reminder.kind === "once") {
    const at = new Date(reminder.at);
    at.setHours(hour, minute, 0, 0);
    return { kind: "once", at };
  }
  return { ...reminder, hour, minute };
}

export function ReminderEditorSheet({
  visible,
  reminder,
  onChange,
  onClose,
}: ReminderEditorSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [timeScrollerKey, setTimeScrollerKey] = useState(0);
  const translateY = useSharedValue(0);
  const hour =
    reminder.kind === "once" ? reminder.at.getHours() : reminder.hour;
  const minute =
    reminder.kind === "once" ? reminder.at.getMinutes() : reminder.minute;

  const commit = (next: ItemReminder): boolean => {
    if (next.kind === "once" && !isReminderSchedulable(next)) return false;
    onChange(next);
    return true;
  };
  const dismissPan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      "worklet";
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      "worklet";
      if (shouldDismissReminderEditor(event.translationY)) {
        runOnJS(onClose)();
      }
    })
    .onFinalize(() => {
      "worklet";
      translateY.value = withTiming(0, { duration: 180 });
    });
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar lembrete"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              animatedSheetStyle,
              {
                backgroundColor: colors.surface,
                paddingBottom: spacing.md + insets.bottom,
              },
            ]}
          >
            <GestureDetector gesture={dismissPan}>
              <View style={styles.dragHeader}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Lembrete
                </Text>
              </View>
            </GestureDetector>

            {reminder.kind === "once" ? (
              <ReminderMonthCalendar
                selected={reminder.at}
                disablePastDays
                onSelectDate={(date) => commit(withDate(reminder, date))}
              />
            ) : null}

            {reminder.kind === "weekly" ? (
              <ReminderWeekdayPicker
                selected={reminder.weekday}
                onSelect={(weekday) =>
                  commit(withWeekday(reminder, weekday))
                }
              />
            ) : null}

            <ReminderTimeScroller
              key={timeScrollerKey}
              hour={hour}
              minute={minute}
              onChange={(nextHour, nextMinute) => {
                const accepted = commit(
                  withTime(reminder, nextHour, nextMinute)
                );
                if (!accepted) {
                  setTimeScrollerKey((current) => current + 1);
                }
              }}
            />

            <View style={styles.repetitionRow}>
              {REPETITION_OPTIONS.map((option) => {
                const active = option.value === reminder.kind;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={`Repetição: ${option.label}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      if (active) return;
                      commit(applyReminderRepetition(reminder, option.value));
                    }}
                    style={({ pressed }) => [
                      styles.repetitionPill,
                      {
                        backgroundColor:
                          active || pressed
                            ? colors.accentSubtle
                            : colors.surfaceMuted,
                        borderColor: active
                          ? colors.accentBorder
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.repetitionText,
                        {
                          color: active ? colors.action : colors.textSecondary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onChange(null);
                onClose();
              }}
              style={({ pressed }) => [
                styles.remove,
                {
                  backgroundColor: pressed
                    ? colors.dangerSubtle
                    : "transparent",
                },
              ]}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                Remover lembrete
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  dragHeader: {
    gap: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: fontSize.title,
    textAlign: "center",
  },
  repetitionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  repetitionPill: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
  },
  repetitionText: {
    fontFamily: font.medium,
    fontSize: fontSize.body,
  },
  remove: {
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  removeText: {
    fontFamily: font.medium,
    fontSize: fontSize.body,
  },
});
