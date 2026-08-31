import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthScreenShell } from "../../src/components/auth/AuthScreenShell";
import { AuthTextField } from "../../src/components/auth/AuthTextField";
import { PrimaryButton } from "../../src/components/auth/PrimaryButton";
import { useAuth } from "../../src/features/auth/AuthProvider";
import { getAuthErrorMessage } from "../../src/features/auth/authErrors";
import {
    validateSignUp,
    type SignUpErrors,
} from "../../src/features/auth/emailAuthValidation";
import { getLoginPalette } from "../../src/features/auth/loginPresentation";
import { font, fontSize, spacing } from "../../src/lib/theme";
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
    <View style={styles.screen}>
      <StatusBar style="light" />
      <AuthScreenShell
        heroBackground={palette.heroBackground}
        logoColor={palette.logo}
        taglineColor={palette.tagline}
        taglineOpacity={palette.taglineOpacity}
        dockBackground={palette.dockBackground}
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
      </AuthScreenShell>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
