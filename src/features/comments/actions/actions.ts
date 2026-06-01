"use server";

import { getCurrentUser } from "@/lib/auth/helpers";
import {
  createUpdateCommentSchema,
  CreateUpdateCommentSchemaType,
} from "./schemas";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NO_PERMISSION_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { insertCommentDb, updateCommentDb } from "../server/comments";

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
