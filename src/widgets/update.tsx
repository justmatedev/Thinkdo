import { Platform } from "react-native";
import {
  requestWidgetUpdate,
  type WidgetInfo,
  type WidgetRepresentation,
} from "react-native-android-widget";
import { resolveCaptureWidgetRepresentation } from "./capture/captureWidgetRender";
import { resolveInboxWidgetRepresentation } from "./inbox/inboxWidgetRender";
import { WIDGET_NATIVE_NAMES, type WidgetId } from "./registry";

export function requestNamedWidgetUpdate(
  id: WidgetId,
  renderWidget: (
    info: WidgetInfo
  ) => WidgetRepresentation | Promise<WidgetRepresentation>
): void {
  if (Platform.OS !== "android") return;
  void requestWidgetUpdate({
    widgetName: WIDGET_NATIVE_NAMES[id],
    renderWidget,
  });
}

export function refreshCaptureWidgets(): void {
  if (Platform.OS !== "android") return;
  requestNamedWidgetUpdate("capture", async (info) =>
    resolveCaptureWidgetRepresentation(info.widgetId, info.width, info.height)
  );
}

export function refreshInboxWidgets(): void {
  if (Platform.OS !== "android") return;
  requestNamedWidgetUpdate("inbox", async (info) =>
    resolveInboxWidgetRepresentation(info.widgetId, info.width, info.height)
  );
}
