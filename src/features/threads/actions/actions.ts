"use server";

import { getCurrentUser } from "@/lib/auth/helpers";
import {
  threadCreationUpdateSchema,
  ThreadCreationUpdateSchemaType,
} from "./schemas";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { insertThreadDb, updateThreadDb } from "../server/threads";

export const createThreadAction = async (
  unsafeData: ThreadCreationUpdateSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const { data, success } = threadCreationUpdateSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const createdThread = await insertThreadDb({ ...data, userId });
    if (!createdThread) {
      throw new Error("Failed to create new thread.");
    }

    return {
      error: false,
      message: "Thread created successfully!",
      threadId: createdThread.id,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const updateThreadAction = async (
  threadId: string,
  unsafeData: ThreadCreationUpdateSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const { data, success } = threadCreationUpdateSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const updatedThread = await updateThreadDb(threadId, userId, data);
    if (!updatedThread) {
      throw new Error("Failed to update thread.");
    }

    return {
      error: false,
      message: "Thread updated successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};
