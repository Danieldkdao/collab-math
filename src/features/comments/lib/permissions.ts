import { db } from "@/db/db";
import { CommentTable, ThreadTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type CommentActionType = "update" | "delete";

export const checkUserCommentPermissions = async (
  userId: string | null | undefined,
  threadId: string,
  commentId: string,
  actions: CommentActionType[],
) => {
  const existingThread = await db.query.ThreadTable.findFirst({
    where: eq(ThreadTable.id, threadId),
  });

  if (!existingThread || !userId) return false;

  if (existingThread.userId === userId) return true;

  const [existingComment] = await db
    .select()
    .from(CommentTable)
    .where(
      and(eq(CommentTable.id, commentId), eq(CommentTable.threadId, threadId)),
    );
  if (!existingComment) return false;

  const permissionResults: boolean[] = [];

  const parsedActions = [...new Set(actions)];

  parsedActions.forEach((action) => {
    const permissionResult = getUserCommentPermission(
      userId,
      existingComment,
      action,
    );
    permissionResults.push(permissionResult);
  });

  return permissionResults.every(Boolean);
};

const getUserCommentPermission = (
  userId: string,
  existingComment: typeof CommentTable.$inferSelect,
  action: CommentActionType,
) => {
  switch (action) {
    case "update":
      return existingComment.userId === userId;
    case "delete":
      return existingComment.userId === userId;
    default:
      throw new Error(`Unknown comment action: ${action satisfies never}`);
  }
};
