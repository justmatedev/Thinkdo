"use no memo";

import type { WidgetRepresentation } from "react-native-android-widget";
import {
  resolveCaptureWidgetRenderMode,
  type CaptureWidgetRenderMode,
} from "../capture/captureWidgetRenderMode";
import { loadWidgetThemePreference } from "../capture/widgetThemePreference";
import { readInboxSnapshot, type InboxSnapshot } from "../snapshot/inboxSnapshot";
import type { InboxFilter } from "../../types/item";
import { InboxWidget } from "./InboxWidget";
import { loadInboxWidgetFilter } from "./inboxWidgetFilter";

export function buildInboxWidgetRepresentation(
  width: number,
  height: number,
  mode: CaptureWidgetRenderMode,
  filter: InboxFilter,
  snapshot: InboxSnapshot
): WidgetRepresentation {
  if (mode.kind === "day_night") {
    return {
      light: (
        <InboxWidget
          width={width}
          height={height}
          themeName="light"
          filter={filter}
          snapshot={snapshot}
        />
      ),
      dark: (
        <InboxWidget
          width={width}
          height={height}
          themeName="dark"
          filter={filter}
          snapshot={snapshot}
        />
      ),
    };
  }

  return (
    <InboxWidget
      width={width}
      height={height}
      themeName={mode.themeName}
      filter={filter}
      snapshot={snapshot}
    />
  );
}

export async function resolveInboxWidgetRepresentation(
  widgetId: number,
  width: number,
  height: number
): Promise<WidgetRepresentation> {
  const [themePreference, filter, snapshot] = await Promise.all([
    loadWidgetThemePreference(widgetId),
    loadInboxWidgetFilter(widgetId),
    readInboxSnapshot(),
  ]);

  return buildInboxWidgetRepresentation(
    width,
    height,
    resolveCaptureWidgetRenderMode(themePreference),
    filter,
    snapshot
  );
}
