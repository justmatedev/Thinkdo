import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Item } from "../../../types/item";
import {
  INBOX_SNAPSHOT_CAP,
  INBOX_SNAPSHOT_KEY,
  buildInboxSnapshot,
  filterInboxSnapshotRows,
  patchInboxSnapshotItemDone,
  readInboxSnapshot,
  toInboxSnapshotRows,
  writeInboxSnapshot,
} from "../inboxSnapshot";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const item = (
  partial: Partial<Item> & Pick<Item, "id" | "type" | "title">
): Item =>
  ({
    done: false,
    body: "",
    color: null,
    reminder: null,
    sortOrder: 1,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...partial,
  }) as Item;

describe("toInboxSnapshotRows", () => {
  it("keeps slim fields and caps length", () => {
    const rows = toInboxSnapshotRows(
      Array.from({ length: 40 }, (_, i) =>
        item({ id: String(i), type: "note", title: `t${i}` })
      ),
      30
    );
    expect(rows).toHaveLength(INBOX_SNAPSHOT_CAP);
    expect(rows[0]).toEqual({
      id: "0",
      type: "note",
      title: "t0",
      done: false,
    });
  });
});

describe("filterInboxSnapshotRows", () => {
  const rows = [
    { id: "1", type: "note" as const, title: "n", done: false },
    { id: "2", type: "task" as const, title: "t", done: true },
  ];
  it("filters notes and tasks", () => {
    expect(filterInboxSnapshotRows(rows, "notes")).toEqual([rows[0]]);
    expect(filterInboxSnapshotRows(rows, "tasks")).toEqual([rows[1]]);
    expect(filterInboxSnapshotRows(rows, "all")).toEqual(rows);
  });
});

describe("read/write/patch", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("round-trips a snapshot", async () => {
    const snap = buildInboxSnapshot({
      signedIn: true,
      items: [item({ id: "a", type: "task", title: "X", done: false })],
      now: 1000,
    });
    await writeInboxSnapshot(snap);
    expect(await readInboxSnapshot()).toEqual(snap);
  });

  it("patches done on an existing row", async () => {
    await writeInboxSnapshot(
      buildInboxSnapshot({
        signedIn: true,
        items: [item({ id: "a", type: "task", title: "X", done: false })],
        now: 1,
      })
    );
    const next = await patchInboxSnapshotItemDone("a", true);
    expect(next?.items[0].done).toBe(true);
  });

  it("returns an empty snapshot when stored JSON is invalid", async () => {
    await AsyncStorage.setItem(INBOX_SNAPSHOT_KEY, "{not-json");
    expect(await readInboxSnapshot()).toEqual({
      updatedAt: 0,
      signedIn: false,
      items: [],
    });
  });

  it("returns null when patching an unknown item", async () => {
    await writeInboxSnapshot(
      buildInboxSnapshot({
        signedIn: true,
        items: [item({ id: "a", type: "task", title: "X", done: false })],
        now: 1,
      })
    );
    expect(await patchInboxSnapshotItemDone("gone", true)).toBeNull();
  });
});
