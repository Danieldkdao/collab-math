import { db } from "@/db/db";
import { ThreadMembershipTable, ThreadTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ThreadActionType = "can_view" | "can_comment";

export const checkUserThreadPermissions = async (
  userId: string | null | undefined,
  threadId: string,
  actions: ThreadActionType[],
) => {
  const existingThread = await db.query.ThreadTable.findFirst({
    where: eq(ThreadTable.id, threadId),
  });

  if (!existingThread) return false;

  if (existingThread.userId === userId || existingThread.isPublic) return true;

  const existingThreadMembership =
    await db.query.ThreadMembershipTable.findFirst({
      where: and(
        eq(ThreadMembershipTable.userId, userId ?? ""),
        eq(ThreadMembershipTable.threadId, existingThread.id),
      ),
      with: {
        thread: true,
      },
    });

  const permissionResults: boolean[] = [];

  const parsedActions = [...new Set(actions)];

  parsedActions.forEach((action) => {
    const permissionResult = getUserThreadPermission(
      existingThreadMembership ?? null,
      action,
    );
    permissionResults.push(permissionResult);
  });

  return permissionResults.every(Boolean);
};

const getUserThreadPermission = (
  existingThreadMembership:
    | (typeof ThreadMembershipTable.$inferSelect & {
        thread: typeof ThreadTable.$inferSelect;
      })
    | null,
  action: ThreadActionType,
) => {
  switch (action) {
    case "can_comment":
      return existingThreadMembership?.status === "accepted";
    case "can_view":
      return (
        existingThreadMembership?.status === "accepted" ||
        existingThreadMembership?.status === "pending"
      );
    default:
      throw new Error(
        `Unknown thread membership action: ${action satisfies never}`,
      );
  }
};
