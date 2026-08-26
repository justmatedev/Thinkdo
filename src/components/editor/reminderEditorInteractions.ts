export const REMINDER_DISMISS_DRAG_Y = 100;

export function shouldDismissReminderEditor(translationY: number): boolean {
  "worklet";
  return translationY > REMINDER_DISMISS_DRAG_Y;
}

export function nextTimeScrollerIndex(
  lastEmittedIndex: number | null,
  nextIndex: number
): number | null {
  return lastEmittedIndex === nextIndex ? null : nextIndex;
}

export function adjustedTimeScrollerIndex(
  currentIndex: number,
  delta: -1 | 1,
  itemCount: number
): number {
  return (currentIndex + delta + itemCount) % itemCount;
}
