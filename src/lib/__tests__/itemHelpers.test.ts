import {
  buildCreatePayload,
  getItemPreview,
  needsRebalance,
  nextSortOrder,
  normalizePreviewText,
  normalizeTitle,
  planInboxReorder,
  rebalanceSortOrders,
  resolveEditorTitle,
  sortOrderBetween,
  toNote,
  toTask,
} from "../itemHelpers";
import type { Item } from "../../types/item";

const note: Item = {
  id: "1",
  type: "note",
  title: "Comprar café",
  body: "Grãos, moagem média",
  done: false,
  color: null,
  reminder: null,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const task: Item = { ...note, id: "2", type: "task", done: true, sortOrder: 2 };

describe("normalizeTitle", () => {
  it("trims valid titles", () => {
    expect(normalizeTitle("  Comprar café  ")).toBe("Comprar café");
  });
  it("returns null for empty or whitespace-only", () => {
    expect(normalizeTitle("")).toBeNull();
    expect(normalizeTitle("   ")).toBeNull();
  });
});

describe("toTask", () => {
  it("converts note to task with done=false and preserves body", () => {
    const patch = toTask(note);
    expect(patch).toEqual({ type: "task", done: false });
    expect(patch).not.toHaveProperty("body");
  });
});

describe("toNote", () => {
  it("converts task to note without touching done", () => {
    expect(toNote(task)).toEqual({ type: "note" });
  });
});

describe("normalizePreviewText", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizePreviewText("  Leite,\n  pão  ")).toBe("Leite, pão");
  });
});

describe("getItemPreview", () => {
  it("returns null for empty body", () => {
    expect(getItemPreview({ title: "Lista", body: "" })).toBeNull();
    expect(getItemPreview({ title: "Lista", body: "   " })).toBeNull();
  });

  it("returns null when body equals title", () => {
    expect(getItemPreview({ title: "Lista", body: "Lista" })).toBeNull();
    expect(getItemPreview({ title: "Lista", body: "  lista  " })).toBeNull();
  });

  it("returns continuation when body starts with title", () => {
    expect(
      getItemPreview({ title: "Lista", body: "Lista: leite, pão" })
    ).toBe("leite, pão");
  });

  it("returns null when the body is only the title plus punctuation", () => {
    expect(getItemPreview({ title: "Lista", body: "Lista:" })).toBeNull();
    expect(getItemPreview({ title: "Lista", body: "Lista —" })).toBeNull();
  });

  it("returns normalized body when it adds context", () => {
    expect(
      getItemPreview({
        title: "Lembrar de tal coisa",
        body: "Tenho que lembrar disso amanhã",
      })
    ).toBe("Tenho que lembrar disso amanhã");
  });
});

describe("nextSortOrder", () => {
  it("returns the provided now value", () => {
    expect(nextSortOrder(1_700_000_000_000)).toBe(1_700_000_000_000);
  });
});

describe("sortOrderBetween", () => {
  it("returns midpoint when both neighbors exist", () => {
    expect(sortOrderBetween(100, 50)).toBe(75);
  });
  it("places above the only below neighbor when moving to top", () => {
    expect(sortOrderBetween(null, 50)).toBe(1050);
  });
  it("places below the only above neighbor when moving to bottom", () => {
    expect(sortOrderBetween(100, null)).toBe(-900);
  });
  it("falls back to nextSortOrder when no neighbors", () => {
    expect(sortOrderBetween(null, null, 42)).toBe(42);
  });
});

describe("needsRebalance", () => {
  it("is true when gap is below minGap", () => {
    expect(needsRebalance(10, 9.5, 1)).toBe(true);
  });
  it("is false when either neighbor is missing", () => {
    expect(needsRebalance(null, 9, 1)).toBe(false);
    expect(needsRebalance(10, null, 1)).toBe(false);
  });
  it("is false when gap is large enough", () => {
    expect(needsRebalance(100, 50, 1)).toBe(false);
  });
});

describe("rebalanceSortOrders", () => {
  it("returns descending values with fixed step", () => {
    expect(rebalanceSortOrders(3, 3000, 1000)).toEqual([3000, 2000, 1000]);
  });
  it("returns empty array for count 0", () => {
    expect(rebalanceSortOrders(0)).toEqual([]);
  });
});

describe("buildCreatePayload", () => {
  it("defaults body to empty string and done to false for notes", () => {
    expect(
      buildCreatePayload({ type: "note", title: "A" }, 1_700_000_000_000)
    ).toEqual({
      type: "note",
      title: "A",
      body: "",
      done: false,
      sortOrder: 1_700_000_000_000,
    });
  });
  it("defaults done to false for tasks", () => {
    expect(
      buildCreatePayload({ type: "task", title: "B" }, 1_700_000_000_001)
    ).toEqual({
      type: "task",
      title: "B",
      body: "",
      done: false,
      sortOrder: 1_700_000_000_001,
    });
  });
  it("keeps provided body and done", () => {
    expect(
      buildCreatePayload(
        { type: "task", title: "C", body: "x", done: true },
        1_700_000_000_002
      )
    ).toEqual({
      type: "task",
      title: "C",
      body: "x",
      done: true,
      sortOrder: 1_700_000_000_002,
    });
  });
  it("includes sortOrder from nextSortOrder(now) when now is passed", () => {
    expect(
      buildCreatePayload({ type: "note", title: "A" }, 1_700_000_000_000)
    ).toEqual({
      type: "note",
      title: "A",
      body: "",
      done: false,
      sortOrder: 1_700_000_000_000,
    });
  });
});

function row(id: string, sortOrder: number): Item {
  return { ...note, id, title: id, sortOrder };
}

describe("planInboxReorder", () => {
  it("is noop when the moved id is not in the visible list", () => {
    expect(planInboxReorder("gone", [row("a", 100)], [row("a", 100)])).toEqual({
      kind: "noop",
    });
  });

  it("places at the top with a gap above the new below neighbor", () => {
    const a = row("a", 100);
    const b = row("b", 50);
    expect(planInboxReorder("b", [b, a], [a, b])).toEqual({
      kind: "midpoint",
      itemId: "b",
      sortOrder: 1100,
    });
  });

  it("places at the bottom with a gap below the new above neighbor", () => {
    const a = row("a", 100);
    const b = row("b", 50);
    expect(planInboxReorder("a", [b, a], [a, b])).toEqual({
      kind: "midpoint",
      itemId: "a",
      sortOrder: -950,
    });
  });

  it("uses the midpoint when both visible neighbors have enough gap", () => {
    const a = row("a", 100);
    const b = row("b", 50);
    const c = row("c", 0);
    expect(planInboxReorder("c", [a, c, b], [a, b, c])).toEqual({
      kind: "midpoint",
      itemId: "c",
      sortOrder: 75,
    });
  });

  it("rebalances the full inbox and inserts after the visible above neighbor", () => {
    const a = row("a", 10);
    const b = row("b", 9.5);
    const c = row("c", 0);
    expect(planInboxReorder("c", [a, c, b], [a, b, c])).toEqual({
      kind: "rebalance",
      orderedIds: ["a", "c", "b"],
    });
  });

  it("rebalances into the full list, not only the filtered visible slice", () => {
    const taskTop = { ...row("t", 300), type: "task" as const };
    const n1 = row("n1", 10);
    const n2 = row("n2", 9.5);
    const n3 = row("n3", 0);
    expect(planInboxReorder("n3", [n1, n3, n2], [taskTop, n1, n2, n3])).toEqual({
      kind: "rebalance",
      orderedIds: ["t", "n1", "n3", "n2"],
    });
  });
});

describe("resolveEditorTitle", () => {
  it("trims a non-empty draft", () => {
    expect(resolveEditorTitle("  Comprar  ", "Antigo")).toBe("Comprar");
  });

  it("keeps the last valid title when the draft is empty", () => {
    expect(resolveEditorTitle("   ", "Comprar café")).toBe("Comprar café");
    expect(resolveEditorTitle("", "Comprar café")).toBe("Comprar café");
  });
});
