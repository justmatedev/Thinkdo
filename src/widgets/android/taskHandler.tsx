"use no memo";

import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { auth } from "../../lib/firebase";
import { updateItem } from "../../services/items";
import { resolveCaptureWidgetRepresentation } from "../capture/captureWidgetRender";
import { clearWidgetThemePreference } from "../capture/widgetThemePreference";
import { CLICK_TOGGLE_DONE } from "../inbox/inboxWidgetActions";
import { clearInboxWidgetInstancePrefs } from "../inbox/inboxWidgetFilter";
import { resolveInboxWidgetRepresentation } from "../inbox/inboxWidgetRender";
import { WIDGET_NATIVE_NAMES } from "../registry";
import { patchInboxSnapshotItemDone } from "../snapshot";

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps
): Promise<void> {
  "use no memo";
  const name = props.widgetInfo.widgetName;

  if (name === WIDGET_NATIVE_NAMES.inbox) {
    switch (props.widgetAction) {
      case "WIDGET_ADDED":
      case "WIDGET_UPDATE":
      case "WIDGET_RESIZED":
        props.renderWidget(
          await resolveInboxWidgetRepresentation(
            props.widgetInfo.widgetId,
            props.widgetInfo.width,
            props.widgetInfo.height
          )
        );
        break;
      case "WIDGET_DELETED":
        await clearInboxWidgetInstancePrefs(props.widgetInfo.widgetId);
        break;
      case "WIDGET_CLICK":
        if (props.clickAction === CLICK_TOGGLE_DONE) {
          const itemId = String(props.clickActionData?.itemId ?? "");
          const done = Boolean(props.clickActionData?.done);
          const uid = auth.currentUser?.uid;
          if (uid && itemId) {
            try {
              await updateItem(uid, itemId, { done });
              await patchInboxSnapshotItemDone(itemId, done);
            } catch {
              // Leave the snapshot unchanged when persistence fails.
            }
          }
          props.renderWidget(
            await resolveInboxWidgetRepresentation(
              props.widgetInfo.widgetId,
              props.widgetInfo.width,
              props.widgetInfo.height
            )
          );
        }
        break;
      default:
        break;
    }
    return;
  }

  if (name !== WIDGET_NATIVE_NAMES.capture) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const representation = await resolveCaptureWidgetRepresentation(
        props.widgetInfo.widgetId,
        props.widgetInfo.width,
        props.widgetInfo.height
      );
      props.renderWidget(representation);
      break;
    }
    case "WIDGET_DELETED": {
      await clearWidgetThemePreference(props.widgetInfo.widgetId);
      break;
    }
    case "WIDGET_CLICK":
      break;
    default:
      break;
  }
}
