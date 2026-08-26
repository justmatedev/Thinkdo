import {
  adjustedTimeScrollerIndex,
  nextTimeScrollerIndex,
  shouldDismissReminderEditor,
} from "../reminderEditorInteractions";

describe("shouldDismissReminderEditor", () => {
  it("dismisses only after a downward drag passes the threshold", () => {
    expect(shouldDismissReminderEditor(100)).toBe(false);
    expect(shouldDismissReminderEditor(101)).toBe(true);
    expect(shouldDismissReminderEditor(-140)).toBe(false);
  });
});

describe("nextTimeScrollerIndex", () => {
  it("suppresses a duplicate index from the same completed scroll", () => {
    expect(nextTimeScrollerIndex(null, 12)).toBe(12);
    expect(nextTimeScrollerIndex(12, 12)).toBeNull();
    expect(nextTimeScrollerIndex(12, 13)).toBe(13);
  });
});

describe("adjustedTimeScrollerIndex", () => {
  it("wraps increment and decrement actions at both ends", () => {
    expect(adjustedTimeScrollerIndex(23, 1, 24)).toBe(0);
    expect(adjustedTimeScrollerIndex(0, -1, 24)).toBe(23);
    expect(adjustedTimeScrollerIndex(59, 1, 60)).toBe(0);
    expect(adjustedTimeScrollerIndex(0, -1, 60)).toBe(59);
  });
});
