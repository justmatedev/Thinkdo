import { type Href, Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../src/features/auth/AuthProvider";
import { flushPendingReminderNavigation } from "../../src/features/reminders/openReminderNavigation";
import { useTheme } from "../../src/lib/themeContext";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    void flushPendingReminderNavigation();
  }, [uid]);

  if (loading) return null;
  if (!user) return <Redirect href={"/login" as Href} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
