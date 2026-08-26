import { deleteItem } from "./items";
import { cancelItemReminder } from "./reminderScheduler";

export type DeleteItemsFullyResult = {
  deleted: string[];
  failed: string[];
};

type Deps = {
  deleteItem: (userId: string, itemId: string) => Promise<void>;
  cancelItemReminder: (itemId: string) => Promise<void>;
};

const defaultDeps: Deps = { deleteItem, cancelItemReminder };

export async function deleteItemsFully(
  userId: string,
  itemIds: string[],
  deps: Deps = defaultDeps
): Promise<DeleteItemsFullyResult> {
  const deleted: string[] = [];
  const failed: string[] = [];
  for (const id of itemIds) {
    try {
      await deps.cancelItemReminder(id);
      await deps.deleteItem(userId, id);
      deleted.push(id);
    } catch {
      failed.push(id);
    }
  }
  return { deleted, failed };
}
