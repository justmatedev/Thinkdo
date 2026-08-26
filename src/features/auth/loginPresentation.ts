import type { AuthUiPalette } from "../../components/auth/authUiPalette";
import {
  themes,
  type ThemeColors,
  type ThemeName,
} from "../../lib/theme";

export type LoginPalette = AuthUiPalette;

export function getLoginPalette(
  colors: ThemeColors,
  themeName: ThemeName
): LoginPalette {
  const fixedLight = themes.light;
  const dark = themeName === "dark";

  return {
    heroBackground: dark ? colors.accentSubtle : colors.brand,
    logo: dark ? colors.brand : fixedLight.textInverse,
    tagline: dark ? colors.actionPressed : fixedLight.textInverse,
    taglineOpacity: dark ? 1 : 0.88,
    dockBackground: colors.background,
    googleBackground: dark ? colors.surfaceMuted : fixedLight.surface,
    googlePressed: dark ? colors.surface : fixedLight.surfaceMuted,
    googleText: dark ? colors.textPrimary : fixedLight.textPrimary,
    googleBorder: colors.border,
    inputBackground: colors.surface,
    inputBorder: colors.border,
    inputFocusBorder: colors.accentBorder,
    inputText: colors.textPrimary,
    placeholder: colors.textSecondary,
    label: colors.textSecondary,
    fieldError: colors.danger,
    primaryBackground: colors.action,
    primaryPressed: colors.actionPressed,
    primaryText: colors.textInverse,
    link: colors.action,
    divider: colors.border,
    dividerText: colors.textSecondary,
  };
}
