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
import { cacheTag } from "next/cache";
import { getThreadIdTag, getUserThreadTag } from "../server/cache/threads";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { ThreadTable } from "@/db/schema";

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
    const createdThread = await insertThreadDb(
      { ...data, userId },
      data.mathProblems.map((p) => p.id),
    );
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
    const updatedThread = await updateThreadDb(
      threadId,
      userId,
      data,
      data.mathProblems.map((p) => p.id),
    );
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

export const getThreadAction = async (userId: string, threadId: string) => {
  "use cache";
  cacheTag(getThreadIdTag(threadId));

  // todo: add invited people can see or public threads are available to everyone

  const existingThread = await db.query.ThreadTable.findFirst({
    where: and(eq(ThreadTable.id, threadId), eq(ThreadTable.userId, userId)),
    with: {
      user: true,
      mathProblems: {
        with: {
          mathProblem: true,
        },
      },
    },
  });

  return existingThread ?? null;
};

export const getUserThreadsAction = async (userId: string) => {
  "use cache";
  cacheTag(getUserThreadTag(userId));

  // todo: once collaborator table exists maybe add that as separate list on sidebar like My Threads (the threads that the current user owns) and Shared Threads (threads that the current user is a collaborator in but not owner)

  const threads = await db
    .select()
    .from(ThreadTable)
    .where(eq(ThreadTable.userId, userId));

  return threads;
};
