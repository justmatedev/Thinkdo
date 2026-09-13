# Inbox widget scroll (hybrid ListWidget)

**Date:** 2026-09-13  
**Status:** Approved in chat; awaiting file review

## Problem

The Android Inbox home-screen widget truncates items to whatever fits in the current height (`ROW_HEIGHT` × `maxRows`). Users with more inbox items than fit cannot scroll inside the widget.

`ListWidget` (Android `AdapterView` / collection RemoteViews) provides native scroll, but previously crashed WidgetPreview / widget configuration activities in release builds. That is why the list was switched to static `FlexWidget` rows.

## Goal

Restore scrollable inbox rows on the **home-screen widget**, while keeping the **configuration preview** on the static (non-scroll) path so config/preview stays stable.

## Approach (chosen)

**Hybrid:**

| Surface | Container | Item set |
| --- | --- | --- |
| Home widget render (`inboxWidgetRender` / task handler) | `ListWidget` | All filtered snapshot rows (up to `INBOX_SNAPSHOT_CAP`) |
| Config preview (`WidgetConfigScreen`) | `FlexWidget` + height-based `slice` | Only rows that fit |

### API

- Add optional `scrollable?: boolean` to `InboxWidget`.
- Default: `true` (home path).
- Config preview passes `scrollable={false}`.

When `scrollable` is true:

- Wrap rows in `ListWidget` with `match_parent` width/height for the list area.
- Do **not** slice by `maxRows`; map full filtered `rows`.

When `scrollable` is false:

- Keep current behavior: `maxRows` from `listHeight / ROW_HEIGHT`, `visible = rows.slice(0, maxRows)`, `FlexWidget` column.

Empty state, row chrome (checkbox / lead slot), click actions (`CLICK_TOGGLE_DONE`, item/home deep links), theme/palette, and snapshot filter stay unchanged.

## Out of scope

- “+N more” overflow indicator
- iOS widgets
- Changing `app.json` cell sizes / min/max dp
- Replacing or upgrading `react-native-android-widget`

## Risks

- `ListWidget` may still be flaky on some launchers; home-only use limits blast radius to RemoteViews on the launcher, not the config Activity.
- If home-screen scroll itself crashes, revert `scrollable` default usage on the home path.

## Verification

1. Rebuild Android native app after the change.
2. Home: Inbox widget with more items than visible height → list scrolls; toggle done and row open still work.
3. Config: open Inbox widget configuration → preview renders without crash; confirm still applies theme/filter.
4. Existing unit tests for inbox widget filter/render helpers remain green; add a small test (or presentation helper) if row-visibility logic is extracted for static vs scroll modes.

## Non-goals for “done”

Manual device confirmation of scroll is required; automated tests cannot fully assert Android RemoteViews scrolling.
