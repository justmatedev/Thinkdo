# Reminder date/time: system picker + ThinkDo chrome

**Date:** 2026-09-07  
**Status:** Approved for implementation planning  
**App:** ThinkDo (Expo SDK 57)

## Problem

Configuring a reminder’s date and time feels awkward. The custom month calendar and dual hour/minute scrollers in `ReminderEditorSheet` do not flow well for a common action. Users already know the OS date/time pickers; our custom controls add friction without enough brand payoff.

## Goal

Replace the custom date calendar and time scroller with the platform system picker (`@react-native-community/datetimepicker`), while keeping ThinkDo branding on the sheet chrome and applying brand accent colors to the system picker where the OS APIs allow.

## Non-goals

- Quick presets (“in 1 hour”, “tomorrow 9:00”)
- Reminder UI on web (remains omitted)
- Changing `ItemReminder` shape or Firestore schema
- Changing Opções → Lembrete entry path, autosave, or notification scheduling semantics
- Full visual parity of the OS picker with ThinkDo layout (impossible by design)

## Approach

**B — ThinkDo rows + system picker on tap**

Keep the existing bottom sheet shell (handle, title, repetition pills, remove). Replace calendar + time scroller with tappable summary rows. Tapping Date or Time opens the native picker. Apply brand colors via Android config plugin and iOS `accentColor` / `themeVariant`.

## UX

### Sheet layout (top → bottom)

1. Drag handle + title **Lembrete**
2. **Repetition** pills: Nunca (`once`) / Diário (`daily`) / Semanal (`weekly`) — same labels and data model as today
3. **When** section (depends on kind):
   - **once:** row **Data** (formatted date) · row **Hora** (HH:mm)
   - **daily:** row **Hora** only
   - **weekly:** existing `ReminderWeekdayPicker` (no useful OS weekday picker) · row **Hora**
4. **Remover lembrete**

### Interaction

- Tap **Data** → native date picker (`mode="date"`)
- Tap **Hora** → native time picker (`mode="time"`)
- **Android:** dialog (`display="default"`)
- **iOS:** `display="spinner"` inline in the sheet under the active Data/Hora row; use `accentColor` = theme `brand`, `themeVariant` matching light/dark; dismiss spinner by tapping the same row again or switching rows
- Locale: `pt-BR`, 24-hour time, consistent with existing reminder copy
- **once** date: `minimumDate` = start of today
- Past **once** datetime: reject via existing `isReminderSchedulable`; do not commit; keep previous value on the row
- No new Save/Cancel on the reminder sheet — live `onChange` + existing autosave (~500 ms) and local schedule sync remain

### Entry / exit (unchanged)

- Add/edit still from editor Opções → Lembrete
- “Adicionar lembrete” still creates `defaultReminderDraft()` and opens the sheet
- Dismiss via backdrop, drag-down, or Android back
- Remove sets `reminder: null` and closes

## Branding

| Surface | Treatment |
|---------|-----------|
| Sheet, rows, pills, weekday list | ThinkDo theme (Poppins, `colors.*`, existing radius/spacing) |
| Android system dialogs | Config plugin on `@react-native-community/datetimepicker`: accent/brand `#8B5CF6` (light) and `#A78BFA` (dark) for date/time picker theme attrs |
| iOS picker | Runtime `accentColor` / `themeVariant` from active theme |

Requires a native rebuild after adding the Android plugin (`npx expo run:android` / `run:ios`) for plugin colors to apply.

## Architecture

### Unchanged

- `ItemReminder` in `src/types/item.ts`
- Firestore parse/persist (`itemRecord`, `items` service)
- `useItemEditor` autosave + `scheduleItemReminder` / `reconcileReminders`
- `ReminderSection` entry (native only; disabled offline)
- Inbox bell / notification tap navigation

### Dependency

- Add `@react-native-community/datetimepicker` with `npx expo install` (Expo SDK 57)
- Register styling config plugin in `app.json` plugins array

### UI changes

| Action | File / unit |
|--------|-------------|
| Rework | `ReminderEditorSheet.tsx` — pills + rows + picker open state |
| Add | Small row component (label + value) for Data/Hora |
| Add | Thin DateTimePicker wrapper (platform display, commit helpers) |
| Keep | `ReminderWeekdayPicker.tsx` for weekly |
| Keep | Drag-dismiss via `shouldDismissReminderEditor` |
| Remove | `ReminderMonthCalendar.tsx` |
| Remove | `ReminderTimeScroller.tsx` |
| Clean | `reminderEditorInteractions.ts` — drop scroller-only helpers; keep dismiss threshold |
| Clean | `showsReminderCalendar` in `reminderHelpers.ts` if unused after change |

### Data flow

```
User taps Data/Hora
  → show DateTimePicker (date | time)
  → onChange / confirm
  → build next ItemReminder (preserve other fields)
  → if once && !isReminderSchedulable → ignore / revert UI
  → else onChange(next) → useItemEditor autosave → Firestore + scheduleItemReminder
```

## Testing

- Remove or rewrite tests tied only to time scroller index helpers
- Keep dismiss-threshold tests
- Keep / extend `reminderHelpers` tests for repetition and schedulability
- Prefer testing date/time commit logic as pure helpers where practical (Jest + jest-expo)

## Rollout notes

1. Install package + plugin
2. Implement sheet UI
3. Delete obsolete calendar/scroller files
4. Rebuild native apps so Android picker theme applies
5. Manual check: once / daily / weekly on Android and iOS; permission denied path; past once rejection

## Success criteria

- Setting date and time uses the OS picker, not the custom calendar/scroller
- Sheet still reads as ThinkDo (chrome + rows)
- Brand accent visible on system pickers where the platform allows
- Existing reminder kinds, persistence, and notifications keep working
- No reminder UI regression expectation on web (still none)
