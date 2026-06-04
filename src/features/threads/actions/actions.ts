"use server";

import { db } from "@/db/db";
import { CommentTable, ThreadMembershipTable, ThreadTable } from "@/db/schema";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { getUserThreadMembershipTag } from "@/features/thread-memberships/server/cache/thread-memberships";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  SQL,
} from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getThreadIdTag, getUserThreadTag } from "../server/cache/threads";
import { insertThreadDb, updateThreadDb } from "../server/threads";
import {
  threadCreationUpdateSchema,
  ThreadCreationUpdateSchemaType,
} from "./schemas";
import { getMathProblemIdTag } from "@/features/math-problems/server/cache/math-problems";
import {
  ThreadFilterByOptionType,
  ThreadSortByOptionType,
} from "../lib/params";
import { PAGE_SIZE } from "@/lib/constants";

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

  if (existingThread.mathProblems.length) {
    cacheTag(
      ...existingThread.mathProblems.map((problem) =>
        getMathProblemIdTag(problem.mathProblemId),
      ),
    );
  }

  if (existingThread.userId === userId || existingThread.isPublic)
    return existingThread;

  if (
    !existingThread.isPublic &&
    !(await checkUserThreadPermissions(userId, existingThread.id, ["can_view"]))
  )
    return null;

  return existingThread;
};

export const getUserThreadsAction = async (
  userId: string,
  filterOptions: {
    page: number;
    search: string;
    sortBy: ThreadSortByOptionType;
    filterBy: ThreadFilterByOptionType;
  },
) => {
  "use cache";
  cacheTag(getUserThreadTag(userId));

  const { page, search, sortBy, filterBy } = filterOptions;

  const collaboratorCount = countDistinct(ThreadMembershipTable.userId);
  const commentCount = countDistinct(CommentTable.id);
  const searchFilter = search.trim()
    ? or(
        ilike(ThreadTable.title, `%${search.trim()}%`),
        ilike(ThreadTable.description, `%${search.trim()}%`),
      )
    : undefined;

  const offset = (page - 1) * PAGE_SIZE;

  const sortByMap: Record<ThreadSortByOptionType, SQL<unknown>> = {
    oldest: asc(ThreadTable.createdAt),
    most_recent: desc(ThreadTable.createdAt),
    most_collaborators: desc(collaboratorCount),
    most_comments: desc(commentCount),
  };

  const filterByMap: Record<
    ThreadFilterByOptionType,
    SQL<unknown> | undefined
  > = {
    all: undefined,
    private: eq(ThreadTable.isPublic, false),
    public: eq(ThreadTable.isPublic, true),
  };

  const threads = await db
    .select({
      ...getTableColumns(ThreadTable),
      totalCollaborators: collaboratorCount,
      totalComments: commentCount,
    })
    .from(ThreadTable)
    .leftJoin(
      ThreadMembershipTable,
      eq(ThreadMembershipTable.threadId, ThreadTable.id),
    )
    .leftJoin(CommentTable, eq(CommentTable.threadId, ThreadTable.id))
    .where(
      and(eq(ThreadTable.userId, userId), searchFilter, filterByMap[filterBy]),
    )
    .groupBy(ThreadTable.id)
    .orderBy(sortByMap[sortBy])
    .offset(offset)
    .limit(PAGE_SIZE);

  const [threadCount] = await db
    .select({
      total: count(),
    })
    .from(ThreadTable)
    .where(
      and(eq(ThreadTable.userId, userId), searchFilter, filterByMap[filterBy]),
    );

  const hasPrevPage = page > 1;
  const hasNextPage = PAGE_SIZE * page < threadCount.total;

  return {
    threads,
    metadata: {
      hasPrevPage,
      hasNextPage,
    },
  };
};

export const getUserSidebarThreadsAction = async (userId: string) => {
  "use cache";
  cacheTag(getUserThreadTag(userId));

  const threads = await db
    .select()
    .from(ThreadTable)
    .where(eq(ThreadTable.userId, userId))
    .limit(PAGE_SIZE);

  return threads;
};
