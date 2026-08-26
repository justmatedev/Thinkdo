export type InboxSnapshotRow = {
  id: string;
  type: "note" | "task";
  title: string;
  done: boolean;
};

export type InboxSnapshot = {
  updatedAt: number;
  signedIn: boolean;
  items: InboxSnapshotRow[];
};
