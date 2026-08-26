import { useEffect, useRef, useState } from "react";
import {
  AccessibilityActionEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { font, fontSize, radius, spacing } from "../../lib/theme";
import { useTheme } from "../../lib/themeContext";
import {
  adjustedTimeScrollerIndex,
  nextTimeScrollerIndex,
} from "./reminderEditorInteractions";

const ITEM_H = 40;
const VISIBLE = 3;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
/** Below this |velocity.y|, treat end-drag as settled (no momentum). */
const SETTLE_VELOCITY = 0.05;

export type ReminderTimeScrollerProps = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function indexFromOffset(y: number, length: number): number {
  return Math.min(length - 1, Math.max(0, Math.round(y / ITEM_H)));
}

function Column({
  data,
  value,
  onIndex,
  accessibilityLabel,
  color,
  muted,
}: {
  data: number[];
  value: number;
  onIndex: (i: number) => void;
  accessibilityLabel: string;
  color: string;
  muted: string;
}) {
  const ref = useRef<ScrollView>(null);
  const lastEmittedIndex = useRef<number | null>(value);
  const interacting = useRef(false);
  const [activeIndex, setActiveIndex] = useState(value);
  const pad = ((VISIBLE - 1) / 2) * ITEM_H;

  useEffect(() => {
    // Never fight an in-flight flick / drag — that caused snap-back.
    if (interacting.current) return;
    lastEmittedIndex.current = value;
    setActiveIndex(value);
    ref.current?.scrollTo({ y: value * ITEM_H, animated: false });
  }, [value]);

  const settle = (y: number) => {
    interacting.current = false;
    const i = indexFromOffset(y, data.length);
    setActiveIndex(i);
    const nextIndex = nextTimeScrollerIndex(lastEmittedIndex.current, i);
    if (nextIndex == null) return;
    lastEmittedIndex.current = nextIndex;
    onIndex(nextIndex);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = indexFromOffset(e.nativeEvent.contentOffset.y, data.length);
    setActiveIndex(i);
  };

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = e.nativeEvent.velocity?.y ?? 0;
    // If there will be momentum, wait for onMomentumScrollEnd.
    if (Math.abs(velocityY) > SETTLE_VELOCITY) return;
    settle(e.nativeEvent.contentOffset.y);
  };

  const onMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    settle(e.nativeEvent.contentOffset.y);
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    const delta = event.nativeEvent.actionName === "increment" ? 1 : -1;
    onIndex(adjustedTimeScrollerIndex(value, delta, data.length));
  };

  return (
    <ScrollView
      ref={ref}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: activeIndex, text: pad2(activeIndex) }}
      accessibilityActions={[
        { name: "increment" },
        { name: "decrement" },
      ]}
      onAccessibilityAction={onAccessibilityAction}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      snapToAlignment="center"
      decelerationRate="normal"
      nestedScrollEnabled
      scrollEventThrottle={16}
      onScrollBeginDrag={() => {
        interacting.current = true;
      }}
      onScroll={onScroll}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onLayout={() => {
        if (interacting.current) return;
        ref.current?.scrollTo({ y: value * ITEM_H, animated: false });
      }}
      style={{ height: ITEM_H * VISIBLE, width: 64 }}
    >
      <View style={{ height: pad }} />
      {data.map((n) => {
        const distance = Math.abs(n - activeIndex);
        const selected = n === activeIndex;
        return (
          <View key={n} style={styles.item}>
            <Text
              style={{
                fontFamily: selected ? font.semibold : font.medium,
                fontSize: selected ? fontSize.editorTitle : fontSize.title,
                color: selected ? color : muted,
                opacity: distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25,
                textAlign: "center",
                lineHeight: ITEM_H,
              }}
            >
              {pad2(n)}
            </Text>
          </View>
        );
      })}
      <View style={{ height: pad }} />
    </ScrollView>
  );
}

export function ReminderTimeScroller({
  hour,
  minute,
  onChange,
}: ReminderTimeScrollerProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceMuted }]}>
      <View
        pointerEvents="none"
        style={[
          styles.selectionBand,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      />
      <Column
        data={HOURS}
        value={hour}
        accessibilityLabel="Hora do lembrete"
        color={colors.textPrimary}
        muted={colors.textSecondary}
        onIndex={(i) => onChange(i, minute)}
      />
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: fontSize.editorTitle,
          color: colors.textSecondary,
          lineHeight: ITEM_H,
        }}
      >
        :
      </Text>
      <Column
        data={MINUTES}
        value={minute}
        accessibilityLabel="Minuto do lembrete"
        color={colors.textPrimary}
        muted={colors.textSecondary}
        onIndex={(i) => onChange(hour, i)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    height: ITEM_H * VISIBLE,
    overflow: "hidden",
  },
  selectionBand: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    height: ITEM_H,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  item: {
    height: ITEM_H,
    justifyContent: "center",
  },
});
