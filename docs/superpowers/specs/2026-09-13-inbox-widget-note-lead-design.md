# Inbox widget note lead icon

**Date:** 2026-09-13  
**Status:** Approved in chat; awaiting file review

## Problem

On the Android Inbox widget, note rows use an empty lead `FlexWidget` for alignment with task checkboxes. Under `ListWidget`, that empty slot often collapses, so note titles sit further left than task titles. Notes also look less “typed” than tasks, which show a checkbox.

## Goal

Give note rows a visible lead icon in the same slot size as the task checkbox so titles share one vertical edge and the list looks consistent.

## Approach

In `InboxWidget.tsx` only, replace the empty note lead with a non-interactive-looking but tappable lead that opens the item:

| Element | Spec |
| --- | --- |
| Outer slot | `LEAD_SLOT` 36dp, centered, same height as row |
| Frame | `CHECK_SIZE` 22dp, `borderRadius` 6, `borderWidth` 2 |
| Border / glyph color | `palette.accent` |
| Background | `palette.background` (never filled like a done task) |
| Glyph | `TextWidget` with `≡`, centered, size ~13, weight 700 |
| Click | `OPEN_URI` → `inboxItemDeepLink(row.id)` (same as title) |
| Accessibility | e.g. `Abrir {title}` / note-oriented label |

Task checkbox chrome and toggle behavior stay unchanged.

## Out of scope

- App inbox `ItemRow` (notes remain without a lead icon in-app)
- Sticky-note PNG/SVG / IconWidget fonts
- Theme, filter, scroll, snapshot, `app.json` sizes

## Verification

1. Home Inbox widget with mixed notes and tasks: note leads show the framed `≡`; titles align with task titles.
2. Tap note lead and note title both open the item.
3. Task checkbox still toggles done; config preview still uses `scrollable={false}` and shows the note lead.
4. No new unit test required unless a tiny pure constant/helper is extracted; visual check on device is the main gate.
