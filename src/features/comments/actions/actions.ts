"use server";

import { db } from "@/db/db";
import { CommentTable } from "@/db/schemas/comment";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { User } from "@/lib/auth/auth";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NO_PERMISSION_ERROR_MESSAGE,
  NOT_FOUND_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import { and, desc, eq, isNull, not } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getThreadCommentTag } from "../server/cache/comments";
import {
  deleteCommentDb,
  insertCommentDb,
  updateCommentDb,
} from "../server/comments";
import {
  createUpdateCommentSchema,
  CreateUpdateCommentSchemaType,
} from "./schemas";
import { ThreadTable } from "@/db/schema";
import { checkUserCommentPermissions } from "../lib/permissions";

const getCommentData = async (
  threadId: string,
  commentId: string,
): Promise<
  | { userId: string; threadId: string; commentId: string }
  | { error: boolean; message: string }
> => {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const [existingThread] = await db
    .select()
    .from(ThreadTable)
    .where(eq(ThreadTable.id, threadId));
  if (!existingThread) {
    return {
      error: true,
      message: NOT_FOUND_MESSAGE("Thread"),
    };
  }

  const [existingComment] = await db
    .select()
    .from(CommentTable)
    .where(
      and(
        eq(CommentTable.id, commentId),
        eq(CommentTable.threadId, threadId),
        not(eq(CommentTable.status, "deleted")),
      ),
    );
  if (!existingComment) {
    return {
      error: true,
      message: NOT_FOUND_MESSAGE("Comment"),
    };
  }

  return {
    userId,
    threadId: existingThread.id,
    commentId: existingComment.id,
  };
};

export const createCommentAction = async (
  threadId: string,
  unsafeData: CreateUpdateCommentSchemaType,
  parentId?: string | null,
) => {
  const { userId } = await getCurrentUser();

  if (!(await checkUserThreadPermissions(userId, threadId, ["can_comment"]))) {
    return {
      error: true,
      message: NO_PERMISSION_ERROR_MESSAGE,
    };
  }

  const { data, success } = createUpdateCommentSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const createdComment = await insertCommentDb({
      ...data,
      threadId,
      userId,
      parentId,
    });

    if (!createdComment) {
      throw new Error("Failed to create comment.");
    }

    return {
      error: false,
      message: "Comment posted successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const updateCommentAction = async (
  commentId: string,
  threadId: string,
  unsafeData: CreateUpdateCommentSchemaType,
) => {
  const response = await getCommentData(threadId, commentId);
  if ("error" in response) return response;

  if (
    !(await checkUserCommentPermissions(
      response.userId,
      response.threadId,
      response.commentId,
      ["update"],
    ))
  ) {
    return {
      error: true,
      message: NO_PERMISSION_ERROR_MESSAGE,
    };
  }
  const { success, data } = createUpdateCommentSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const updatedComment = await updateCommentDb(
      response.commentId,
      response.threadId,
      {
        ...data,
        status: "updated",
        lastActionAt: new Date(),
      },
    );

    if (!updatedComment) {
      throw new Error("Failed to update comment.");
    }

    return {
      error: false,
      message: "Comment updated successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const deleteCommentAction = async (
  commentId: string,
  threadId: string,
) => {
  const response = await getCommentData(threadId, commentId);
  if ("error" in response) return response;

  if (
    !(await checkUserCommentPermissions(
      response.userId,
      response.threadId,
      response.commentId,
      ["delete"],
    ))
  ) {
    return {
      error: true,
      message: NO_PERMISSION_ERROR_MESSAGE,
    };
  }
  try {
    const deletedComment = await deleteCommentDb(
      response.commentId,
      response.threadId,
    );
    if (!deletedComment) {
      throw new Error("Failed to delete comment.");
    }

    return {
      error: false,
      message: "Comment deleted successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const getThreadComments = async (
  threadId: string,
  commentId?: string,
): Promise<
  | (typeof CommentTable.$inferSelect & {
      user: User | null;
      comments: (typeof CommentTable.$inferSelect)[];
    })[]
  | null
> => {
  "use cache";
  cacheTag(getThreadCommentTag(threadId));

  try {
    const comments = await db.query.CommentTable.findMany({
      where: and(
        eq(CommentTable.threadId, threadId),
        commentId
          ? eq(CommentTable.parentId, commentId)
          : isNull(CommentTable.parentId),
      ),
      with: {
        user: true,
        comments: true,
      },
      orderBy: [desc(CommentTable.createdAt), desc(CommentTable.id)],
    });

    return comments;
  } catch (error) {
    console.error(error);
    console.error("cause", error instanceof Error ? error.cause : undefined);
    return null;
  }
};
