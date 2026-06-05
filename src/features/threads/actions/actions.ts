"use server";

import { db } from "@/db/db";
import {
  CommentTable,
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadMembershipTable,
  ThreadTable,
  user,
} from "@/db/schema";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { getUserThreadMembershipTag } from "@/features/thread-memberships/server/cache/thread-memberships";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NO_PERMISSION_ERROR_MESSAGE,
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
  sql,
  SQL,
} from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getThreadIdTag, getUserThreadTag } from "../server/cache/threads";
import {
  deleteThreadDb,
  insertThreadDb,
  updateThreadDb,
} from "../server/threads";
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
import { User } from "@/lib/auth/auth";

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

export const deleteThreadAction = async (threadId: string) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  if (!(await checkUserThreadPermissions(userId, threadId, ["can_delete"]))) {
    return {
      error: true,
      message: NO_PERMISSION_ERROR_MESSAGE,
    };
  }

  try {
    const deletedThread = await deleteThreadDb(userId, threadId);
    if (!deletedThread) {
      throw new Error("Failed to delete thread.");
    }

    return {
      error: false,
      message: "Thread deleted successfully!",
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
      mathProblems: sql<
        (typeof ThreadMathProblemTable.$inferSelect & {
          mathProblem: typeof MathProblemTable.$inferSelect;
        })[]
      >`(
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'threadId', thread_math_problems.thread_id,
              'mathProblemId', thread_math_problems.math_problem_id,
              'mathProblem', (
                SELECT jsonb_build_object(
                  'id', mpt.id,
                  'title', mpt.title,
                  'content', mpt.content,
                  'createdAt', mpt.created_at,
                  'updatedAt', mpt.updated_at
                )
                FROM ${MathProblemTable} mpt
                WHERE mpt.id = thread_math_problems.math_problem_id
                LIMIT 1
              )
            )
          ),
          '[]'::jsonb
        )
        FROM (
          SELECT
            tmpt.thread_id AS thread_id,
            tmpt.math_problem_id AS math_problem_id
          FROM ${ThreadMathProblemTable} tmpt
          WHERE tmpt.thread_id = ${ThreadTable.id}
        ) AS thread_math_problems
      )`,
      memberships: sql<
        (typeof ThreadMembershipTable.$inferSelect & { user: User })[]
      >`(
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'threadId', thread_memberships.thread_id,
              'userId', thread_memberships.user_id,
              'status', thread_memberships.membership_status,
              'createdAt', thread_memberships.created_at,
              'respondedAt', thread_memberships.responded_at,
              'user', (
                SELECT json_build_object(
                  'id', ut.id,
                  'name', ut.name,
                  'email', ut.email,
                  'emailVerified', ut.email_verified,
                  'image', ut.image,
                  'createdAt', ut.created_at,
                  'updatedAt', ut.updated_at
                )
                FROM ${user} ut
                WHERE ut.id = thread_memberships.user_id
                LIMIT 1
              )
            )
          ),
          '[]'::jsonb
        )
        FROM (
          SELECT
            tmt.thread_id AS thread_id,
            tmt.user_id AS user_id,
            tmt.status AS membership_status,
            tmt.created_at AS created_at,
            tmt.responded_at AS responded_at
          FROM ${ThreadMembershipTable} tmt
          WHERE tmt.thread_id = ${ThreadTable.id}
        ) AS thread_memberships
      )`,
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
    .orderBy(desc(ThreadTable.updatedAt))
    .limit(PAGE_SIZE);

  return threads;
};
