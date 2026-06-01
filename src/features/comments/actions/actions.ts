"use server";

import { db } from "@/db/db";
import { CommentTable } from "@/db/schemas/comment";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { User } from "@/lib/auth/auth";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NO_PERMISSION_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import { and, desc, eq, isNull } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getThreadCommentTag } from "../server/cache/comments";
import { insertCommentDb, updateCommentDb } from "../server/comments";
import {
  createUpdateCommentSchema,
  CreateUpdateCommentSchemaType,
} from "./schemas";

export const createCommentAction = async (
  threadId: string,
  unsafeData: CreateUpdateCommentSchemaType,
  parentId?: string,
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
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "You must be signed in to update comments.",
    };
  }

  if (!(await checkUserThreadPermissions(userId, threadId, ["can_comment"]))) {
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
    const updatedComment = await updateCommentDb(commentId, userId, threadId, {
      ...data,
    });

    if (!updatedComment) {
      throw new Error("Failed to update comment.");
    }

    return {
      error: true,
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
