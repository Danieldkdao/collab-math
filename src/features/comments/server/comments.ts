import { db } from "@/db/db";
import { CommentTable } from "@/db/schemas/comment";
import { revalidateCommentCache } from "./cache/comments";
import { and, eq } from "drizzle-orm";

export const insertCommentDb = async (
  commentData: typeof CommentTable.$inferInsert,
) => {
  const [insertedComment] = await db
    .insert(CommentTable)
    .values(commentData)
    .returning();

  revalidateCommentCache(insertedComment.threadId);

  return insertedComment;
};

export const updateCommentDb = async (
  commentId: string,
  userId: string,
  threadId: string,
  commentData: Partial<typeof CommentTable.$inferSelect>,
) => {
  const [updatedComment] = await db
    .update(CommentTable)
    .set(commentData)
    .where(
      and(
        eq(CommentTable.id, commentId),
        eq(CommentTable.userId, userId),
        eq(CommentTable.threadId, threadId),
      ),
    )
    .returning();

  revalidateCommentCache(updatedComment.threadId);

  return updatedComment;
};
