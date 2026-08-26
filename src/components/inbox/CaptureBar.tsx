import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { normalizeTitle } from "../../lib/itemHelpers";
import {
  elevation,
  font,
  fontSize,
  iconSize,
  lineHeight,
  radius,
  spacing,
} from "../../lib/theme";
import { useTheme } from "../../lib/themeContext";
import type { ItemType } from "../../types/item";
import { AppIcon } from "../ui/AppIcon";

type Props = {
  onSubmit: (type: ItemType, title: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
};

export function CaptureBar({ onSubmit, disabled, autoFocus }: Props) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const [type, setType] = useState<ItemType>("note");
  const [focused, setFocused] = useState(false);

  // RN autoFocus only runs on mount; widget opens inbox after load flips this later.
  useEffect(() => {
    if (!autoFocus || disabled) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [autoFocus, disabled]);

  const submit = () => {
    const title = normalizeTitle(text);
    if (!title || disabled) return;
    onSubmit(type, title);
    setText("");
  };

  return (
    <View
      style={[
        styles.bar,
        elevation.capture,
        {
          backgroundColor: colors.surface,
          borderColor: focused ? colors.accentBorder : colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={type === "note" ? "Mudar para tarefa" : "Mudar para nota"}
        onPress={() => setType(type === "note" ? "task" : "note")}
        disabled={disabled}
        hitSlop={spacing.sm}
        style={styles.typeToggle}
      >
        <AppIcon
          name={type === "note" ? "note" : "task"}
          size={iconSize.sm}
          color={colors.brand}
        />
      </Pressable>
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={type === "note" ? "Anote algo…" : "Adicione uma tarefa…"}
        placeholderTextColor={colors.textSecondary}
        editable={!disabled}
        returnKeyType="done"
        autoFocus={autoFocus}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            fontFamily: font.medium,
            fontSize: fontSize.title,
            lineHeight: lineHeight.title,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar"
        onPress={submit}
        disabled={disabled}
        hitSlop={2}
        style={({ pressed }) => [
          styles.submit,
          {
            backgroundColor: pressed ? colors.actionPressed : colors.action,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <AppIcon name="plus" size={iconSize.md} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  typeToggle: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  input: {
    flex: 1,
    alignSelf: "center",
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  submit: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
