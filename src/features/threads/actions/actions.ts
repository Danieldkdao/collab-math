"use server";

import { db } from "@/db/db";
import { ThreadTable } from "@/db/schema";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { getUserThreadMembershipTag } from "@/features/thread-memberships/server/cache/thread-memberships";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getThreadIdTag, getUserThreadTag } from "../server/cache/threads";
import { insertThreadDb, updateThreadDb } from "../server/threads";
import {
  threadCreationUpdateSchema,
  ThreadCreationUpdateSchemaType,
} from "./schemas";

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
      data.collaborators.map((c) => c.id),
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
      data.collaborators.map((c) => c.id),
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
  cacheTag(getThreadIdTag(threadId), getUserThreadMembershipTag(userId));

  const existingThread = await db.query.ThreadTable.findFirst({
    where: eq(ThreadTable.id, threadId),
    with: {
      user: true,
      mathProblems: {
        with: {
          mathProblem: true,
        },
      },
      memberships: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!existingThread) return null;

  if (existingThread.userId === userId || existingThread.isPublic)
    return existingThread;

  if (
    !existingThread.isPublic &&
    !(await checkUserThreadPermissions(userId, existingThread.id, ["can_view"]))
  )
    return null;

  return existingThread;
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
