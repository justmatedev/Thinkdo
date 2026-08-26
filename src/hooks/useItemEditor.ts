import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useAuth } from "../features/auth/AuthProvider";
import { resolveEditorTitle, toNote, toTask } from "../lib/itemHelpers";
import { getItem, updateItem } from "../services/items";
import { deleteItemsFully } from "../services/deleteItemsFully";
import {
  cancelItemReminder,
  requestReminderPermissions,
  scheduleItemReminder,
} from "../services/reminderScheduler";
import type { Item, SaveStatus } from "../types/item";

const AUTOSAVE_MS = 500;

type EditablePatch = Partial<
  Pick<Item, "title" | "body" | "done" | "color" | "reminder">
>;

export function useItemEditor(itemId: string) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastValidTitle = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!uid || !itemId) return;
    getItem(uid, itemId).then((data) => {
      if (!data) {
        setNotFound(true);
        return;
      }
      lastValidTitle.current = data.title;
      setItem(data);
      loaded.current = true;
    });
  }, [uid, itemId]);

  const syncLocalSchedule = async (saved: Item) => {
    if (Platform.OS === "web") return;
    if (!saved.reminder) {
      await cancelItemReminder(saved.id);
      return;
    }
    const granted = await requestReminderPermissions();
    setPermissionDenied(!granted);
    await scheduleItemReminder(saved);
  };

  const scheduleSave = (next: Item) => {
    setItem(next);
    if (!loaded.current || !user) return;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const title = resolveEditorTitle(next.title, lastValidTitle.current);
      lastValidTitle.current = title;
      const payload: Item = { ...next, title };
      try {
        await updateItem(user.uid, next.id, {
          title,
          body: next.body,
          type: next.type,
          done: next.done,
          color: next.color,
          reminder: next.reminder,
        });
        setStatus("saved");
        try {
          await syncLocalSchedule(payload);
        } catch {
          // Persist succeeded; local schedule can retry on reconcile
        }
      } catch {
        setStatus("error");
      }
    }, AUTOSAVE_MS);
  };

  const update = (patch: EditablePatch) => {
    if (!item) return;
    scheduleSave({ ...item, ...patch });
  };

  const convert = () => {
    if (!item) return;
    const patch = item.type === "note" ? toTask(item) : toNote(item);
    scheduleSave({ ...item, ...patch });
  };

  const remove = async () => {
    if (!item || !user) return;
    if (timer.current) clearTimeout(timer.current);
    const { failed } = await deleteItemsFully(user.uid, [item.id]);
    if (failed.length > 0) throw new Error("delete failed");
  };

  return {
    item,
    notFound,
    status,
    permissionDenied,
    update,
    convert,
    remove,
  };
}
