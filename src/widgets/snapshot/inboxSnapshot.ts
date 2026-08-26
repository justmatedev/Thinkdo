import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InboxFilter, Item } from "../../types/item";
import type { InboxSnapshot, InboxSnapshotRow } from "./types";

export const INBOX_SNAPSHOT_KEY = "thinkdo.widget.inbox.snapshot";
export const INBOX_SNAPSHOT_CAP = 30;

const EMPTY_SNAPSHOT: InboxSnapshot = {
  updatedAt: 0,
  signedIn: false,
  items: [],
};

export function toInboxSnapshotRows(
  items: Pick<Item, "id" | "type" | "title" | "done">[],
  cap: number = INBOX_SNAPSHOT_CAP
): InboxSnapshotRow[] {
  return items.slice(0, cap).map(({ id, type, title, done }) => ({
    id,
    type,
    title,
    done,
  }));
}

export function filterInboxSnapshotRows(
  rows: InboxSnapshotRow[],
  filter: InboxFilter
): InboxSnapshotRow[] {
  switch (filter) {
    case "notes":
      return rows.filter((row) => row.type === "note");
    case "tasks":
      return rows.filter((row) => row.type === "task");
    default:
      return rows;
  }
}

export function buildInboxSnapshot(input: {
  signedIn: boolean;
  items: Item[];
  now?: number;
}): InboxSnapshot {
  return {
    updatedAt: input.now ?? Date.now(),
    signedIn: input.signedIn,
    items: toInboxSnapshotRows(input.items),
  };
}

export async function readInboxSnapshot(): Promise<InboxSnapshot> {
  try {
    const stored = await AsyncStorage.getItem(INBOX_SNAPSHOT_KEY);
    if (!stored) return EMPTY_SNAPSHOT;
    return JSON.parse(stored) as InboxSnapshot;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export async function writeInboxSnapshot(
  snapshot: InboxSnapshot
): Promise<void> {
  await AsyncStorage.setItem(INBOX_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export async function clearInboxSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(INBOX_SNAPSHOT_KEY);
}

export async function patchInboxSnapshotItemDone(
  itemId: string,
  done: boolean
): Promise<InboxSnapshot | null> {
  const snapshot = await readInboxSnapshot();
  const index = snapshot.items.findIndex((row) => row.id === itemId);
  if (index === -1) return null;

  const next: InboxSnapshot = {
    ...snapshot,
    items: snapshot.items.map((row) =>
      row.id === itemId ? { ...row, done } : row
    ),
  };
  await writeInboxSnapshot(next);
  return next;
}

export type { InboxSnapshot, InboxSnapshotRow } from "./types";
