import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  font,
  fontSize,
  radius,
  spacing,
  touchTarget,
} from "../../lib/theme";
import { useTheme } from "../../lib/themeContext";
import {
  getConfirmButtonColors,
  type ModalActionVariant,
} from "./modalActionPresentation";

type Props = {
  cancelLabel?: string;
  confirmLabel: string;
  variant?: ModalActionVariant;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ModalActionRow({
  cancelLabel = "Cancelar",
  confirmLabel,
  variant = "default",
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  const { colors } = useTheme();
  const confirm = getConfirmButtonColors(variant, colors);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={onCancel}
        style={({ pressed }) => [
          styles.button,
          styles.cancel,
          {
            borderColor: colors.border,
            backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
            opacity: busy ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {cancelLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={busy ? "Carregando" : confirmLabel}
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={onConfirm}
        style={({ pressed }) => [
          styles.button,
          styles.confirm,
          {
            backgroundColor:
              pressed && !busy ? confirm.pressed : confirm.background,
            opacity: busy ? 0.9 : 1,
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={confirm.text} />
        ) : (
          <Text style={[styles.label, { color: confirm.text }]}>
            {confirmLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancel: {
    borderWidth: 1,
  },
  confirm: {},
  label: {
    fontFamily: font.medium,
    fontSize: fontSize.body,
  },
});
