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
  threadId: string,
  commentData: Partial<typeof CommentTable.$inferSelect>,
) => {
  const [updatedComment] = await db
    .update(CommentTable)
    .set(commentData)
    .where(
      and(eq(CommentTable.id, commentId), eq(CommentTable.threadId, threadId)),
    )
    .returning();

  revalidateCommentCache(updatedComment.threadId);

  return updatedComment;
};

export const deleteCommentDb = async (commentId: string, threadId: string) => {
  const [deletedComment] = await db
    .update(CommentTable)
    .set({
      status: "deleted",
      lastActionAt: new Date(),
      message: "This message has been deleted.",
    })
    .where(
      and(eq(CommentTable.id, commentId), eq(CommentTable.threadId, threadId)),
    )
    .returning();

  while (true) {
    const deletedComments = await db
      .delete(CommentTable)
      .where(
        and(
          eq(CommentTable.parentId, deletedComment.id),
          eq(CommentTable.threadId, threadId),
        ),
      )
      .returning();

    if (deletedComments.length === 0) break;
  }

  revalidateCommentCache(deletedComment.threadId);

  return deletedComment;
};
