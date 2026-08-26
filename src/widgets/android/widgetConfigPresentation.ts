import type { ThemePreference } from "../../lib/theme";
import type { InboxFilter } from "../../types/item";
import { WIDGET_NATIVE_NAMES } from "../registry";

type WidgetConfigKind = "capture" | "inbox";

const FILTER_LABELS: Record<InboxFilter, string> = {
  all: "Tudo",
  notes: "Notas",
  tasks: "Tarefas",
};

const THEME_LABELS: Record<ThemePreference, string> = {
  light: "Tema claro",
  system: "Tema do sistema",
  dark: "Tema escuro",
};

export function resolveWidgetConfigKind(
  widgetName: string
): WidgetConfigKind {
  return widgetName === WIDGET_NATIVE_NAMES.inbox ? "inbox" : "capture";
}

export function widgetConfigSummary(
  filter: InboxFilter,
  theme: ThemePreference
): string {
  return `${FILTER_LABELS[filter]} · ${THEME_LABELS[theme]}`;
}
