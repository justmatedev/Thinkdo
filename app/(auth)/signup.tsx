import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthTextField } from "../../src/components/auth/AuthTextField";
import { PrimaryButton } from "../../src/components/auth/PrimaryButton";
import { BrandLogo } from "../../src/components/brand/BrandLogo";
import { useAuth } from "../../src/features/auth/AuthProvider";
import { getAuthErrorMessage } from "../../src/features/auth/authErrors";
import {
    validateSignUp,
    type SignUpErrors,
} from "../../src/features/auth/emailAuthValidation";
import { getLoginPalette } from "../../src/features/auth/loginPresentation";
import { font, fontSize, radius, spacing } from "../../src/lib/theme";
import { useTheme } from "../../src/lib/themeContext";

export default function SignupScreen() {
  const { colors, themeName } = useTheme();
  const { signUpWithEmail } = useAuth();
  const palette = getLoginPalette(colors, themeName);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignUp = async () => {
    const nextErrors = validateSignUp({ name, email, password, confirm });
    setErrors(nextErrors);
    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirm
    ) {
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await signUpWithEmail({ name, email, password });
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.heroBackground }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.hero}>
          <BrandLogo height={104} color={palette.logo} />
          <Text
            style={[
              styles.tagline,
              { color: palette.tagline, opacity: palette.taglineOpacity },
            ]}
          >
            Abra, escreva, salve
          </Text>
        </SafeAreaView>

        <View style={[styles.dock, { backgroundColor: palette.dockBackground }]}>
          <SafeAreaView edges={["bottom"]}>
            <ScrollView
              contentContainerStyle={styles.dockContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <AuthTextField
                label="Nome"
                value={name}
                onChangeText={setName}
                palette={palette}
                error={errors.name}
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
                returnKeyType="next"
              />
              <AuthTextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                palette={palette}
                error={errors.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
              />
              <AuthTextField
                label="Senha"
                value={password}
                onChangeText={setPassword}
                palette={palette}
                error={errors.password}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                returnKeyType="next"
              />
              <AuthTextField
                label="Confirmar senha"
                value={confirm}
                onChangeText={setConfirm}
                palette={palette}
                error={errors.confirm}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <PrimaryButton
                label="Criar conta"
                busyLabel="Criando conta…"
                busy={busy}
                onPress={handleSignUp}
                palette={palette}
                style={styles.primaryCta}
              />

              {formError ? (
                <Text
                  accessibilityRole="alert"
                  style={[styles.error, { color: palette.fieldError }]}
                >
                  {formError}
                </Text>
              ) : null}

              <Link href="/login" asChild>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={spacing.md}
                  style={styles.linkRow}
                >
                  <Text style={[styles.link, { color: palette.link }]}>
                    Já tenho conta
                  </Text>
                </Pressable>
              </Link>
            </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  hero: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: "52%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  tagline: {
    marginTop: spacing.md,
    fontFamily: font.regular,
    fontSize: fontSize.title,
    textAlign: "center",
  },
  dock: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    flexShrink: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  dockContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  primaryCta: {
    marginTop: spacing.sm,
  },
  linkRow: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    fontFamily: font.medium,
    fontSize: fontSize.meta,
  },
  error: {
    fontFamily: font.regular,
    fontSize: fontSize.meta,
    textAlign: "center",
  },
});
