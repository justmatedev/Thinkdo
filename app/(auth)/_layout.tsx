import { type Href, Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/features/auth/AuthProvider";
import { getLoginPalette } from "../../src/features/auth/loginPresentation";
import { useTheme } from "../../src/lib/themeContext";

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { colors, themeName } = useTheme();
  const palette = getLoginPalette(colors, themeName);

  if (loading) return null;
  if (user) return <Redirect href={"/" as Href} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: palette.heroBackground },
      }}
    />
  );
}
