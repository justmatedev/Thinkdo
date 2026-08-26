"use no memo";

import {
  FlexWidget,
  ListWidget,
  TextWidget,
} from "react-native-android-widget";
import type { ThemeName } from "../../lib/theme";
import type { InboxFilter } from "../../types/item";
import { captureWidgetPalette } from "../capture/captureWidgetTheme";
import {
  filterInboxSnapshotRows,
  type InboxSnapshot,
} from "../snapshot/inboxSnapshot";
import {
  CLICK_TOGGLE_DONE,
  inboxHomeDeepLink,
  inboxItemDeepLink,
} from "./inboxWidgetActions";
import { inboxFilterLabel } from "./inboxWidgetFilter";

/** Matches inbox ItemRow lead column so note/task titles share one vertical edge. */
const LEAD_SLOT = 36;
const CHECK_SIZE = 22;

type Props = {
  width: number;
  height: number;
  themeName: ThemeName;
  filter: InboxFilter;
  snapshot: InboxSnapshot;
};

export function InboxWidget({
  width,
  height,
  themeName,
  filter,
  snapshot,
}: Props) {
  "use no memo";
  const palette = captureWidgetPalette(themeName);
  const rows = filterInboxSnapshotRows(snapshot.items, filter);
  const sidePadding = width < 220 ? 10 : 14;
  const listHeight = Math.max(80, height - 16);

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: inboxHomeDeepLink() }}
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: "column",
        overflow: "hidden",
        paddingHorizontal: sidePadding,
        paddingVertical: 6,
      }}
      accessibilityLabel={`Thinkdo · ${inboxFilterLabel(filter)}`}
    >
      {rows.length === 0 ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: inboxHomeDeepLink() }}
          style={{
            width: "match_parent",
            height: listHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Abrir caixa de entrada do Thinkdo"
        >
          <TextWidget
            text={snapshot.signedIn ? "Nada por aqui" : "Entre no Thinkdo"}
            style={{
              color: palette.textMuted,
              fontSize: 14,
              textAlign: "center",
            }}
          />
        </FlexWidget>
      ) : (
        <ListWidget
          style={{
            width: "match_parent",
            height: listHeight,
          }}
        >
          {rows.map((row) => (
            <FlexWidget
              key={row.id}
              style={{
                width: "match_parent",
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                borderTopColor: palette.border,
                borderTopWidth: row === rows[0] ? 0 : 1,
              }}
            >
              {row.type === "task" ? (
                <FlexWidget
                  clickAction={CLICK_TOGGLE_DONE}
                  clickActionData={{ itemId: row.id, done: !row.done }}
                  style={{
                    width: LEAD_SLOT,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  accessibilityLabel={
                    row.done
                      ? `Marcar ${row.title || "tarefa"} como pendente`
                      : `Concluir ${row.title || "tarefa"}`
                  }
                >
                  <FlexWidget
                    style={{
                      width: CHECK_SIZE,
                      height: CHECK_SIZE,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: palette.accent,
                      // RemoteViews often paints "transparent" as white — match tile surface.
                      backgroundColor: row.done
                        ? palette.accent
                        : palette.background,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {row.done ? (
                      <TextWidget
                        text="✓"
                        style={{
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: "700",
                        }}
                      />
                    ) : null}
                  </FlexWidget>
                </FlexWidget>
              ) : (
                <FlexWidget
                  style={{
                    width: LEAD_SLOT,
                    height: 44,
                  }}
                />
              )}
              <FlexWidget
                clickAction="OPEN_URI"
                clickActionData={{ uri: inboxItemDeepLink(row.id) }}
                style={{
                  height: 44,
                  flex: 1,
                  justifyContent: "center",
                  paddingRight: 6,
                }}
                accessibilityLabel={`Abrir ${row.title || "item sem título"}`}
              >
                <TextWidget
                  text={row.title || "Sem título"}
                  maxLines={1}
                  truncate="END"
                  style={{
                    color: row.done ? palette.textMuted : palette.text,
                    fontSize: 14,
                    fontWeight: "400",
                  }}
                />
              </FlexWidget>
            </FlexWidget>
          ))}
        </ListWidget>
      )}
    </FlexWidget>
  );
}
