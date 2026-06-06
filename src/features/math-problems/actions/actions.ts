"use server";

import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NO_PERMISSION_ERROR_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  createUpdateMathProblemSchema,
  CreateUpdateMathProblemSchemaType,
} from "./schemas";
import {
  deleteMathProblemDb,
  insertMathProblemDb,
  updateMathProblemDb,
} from "../server/math-problems";
import { cacheTag } from "next/cache";
import {
  getMathProblemIdTag,
  getThreadMathProblemTag,
  getUserMathProblemTag,
} from "../server/cache/math-problems";
import { db } from "@/db/db";
import { MathProblemTable, ThreadMathProblemTable } from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  SQL,
} from "drizzle-orm";
import { PAGE_SIZE } from "@/lib/constants";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { getUserThreadMembershipTag } from "@/features/thread-memberships/server/cache/thread-memberships";
import { MathProblemSortByOptionType } from "../lib/params";

export const createMathProblemAction = async (
  unsafeData: CreateUpdateMathProblemSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const { data, success } = createUpdateMathProblemSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const createdMathProblem = await insertMathProblemDb({ ...data, userId });
    if (!createdMathProblem) {
      throw new Error("Failed to create math problem.");
    }

    return {
      error: false,
      message: "Math problem created successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const updateMathProblemAction = async (
  mathProblemId: string,
  unsafeData: CreateUpdateMathProblemSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const { data, success } = createUpdateMathProblemSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const updatedMathProblem = await updateMathProblemDb(
      mathProblemId,
      userId,
      data,
    );
    if (!updatedMathProblem) {
      throw new Error("Failed to update math problem.");
    }

    return {
      error: false,
      message: "Math problem updated successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const deleteMathProblemAction = async (mathProblemId: string) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: UNAUTHED_ERROR_MESSAGE,
    };
  }

  const [existingMathProblem] = await db
    .select()
    .from(MathProblemTable)
    .where(
      and(
        eq(MathProblemTable.userId, userId),
        eq(MathProblemTable.id, mathProblemId),
      ),
    );
  if (!existingMathProblem) {
    return {
      error: true,
      message: NO_PERMISSION_ERROR_MESSAGE,
    };
  }

  try {
    const deletedMathProblem = await deleteMathProblemDb(
      userId,
      existingMathProblem.id,
    );

    if (!deletedMathProblem) {
      throw new Error("Failed to delete math problem.");
    }

    return {
      error: false,
      message: "Math problem deleted successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const getThreadMathProblems = async (
  userId: string | null | undefined,
  threadId: string,
) => {
  "use cache";
  cacheTag(
    getThreadMathProblemTag(threadId),
    ...(userId ? [getUserThreadMembershipTag(userId)] : []),
  );

  if (!(await checkUserThreadPermissions(userId, threadId, ["can_view"])))
    return null;

  const mathProblems = await db
    .select({
      id: MathProblemTable.id,
      userId: MathProblemTable.userId,
      title: MathProblemTable.title,
      content: MathProblemTable.content,
      createdAt: MathProblemTable.createdAt,
      updatedAt: MathProblemTable.updatedAt,
    })
    .from(ThreadMathProblemTable)
    .innerJoin(
      MathProblemTable,
      eq(ThreadMathProblemTable.mathProblemId, MathProblemTable.id),
    )
    .where(eq(ThreadMathProblemTable.threadId, threadId))
    .orderBy(
      desc(MathProblemTable.updatedAt),
      desc(MathProblemTable.createdAt),
    );

  if (mathProblems.length) {
    cacheTag(...mathProblems.map((problem) => getMathProblemIdTag(problem.id)));
  }

  return mathProblems;
};

export const getUserMathProblemsAction = async (
  userId: string,
  filterOptions: {
    search: string;
    page: number;
    sortBy: MathProblemSortByOptionType;
  },
  limit = PAGE_SIZE,
) => {
  "use cache";
  cacheTag(getUserMathProblemTag(userId));

  const { search, page, sortBy } = filterOptions;

  const offset = (page - 1) * PAGE_SIZE;

  const usageInThreads = count(ThreadMathProblemTable.mathProblemId);
  const searchFilter = search.trim()
    ? or(
        ilike(MathProblemTable.title, `%${search.trim()}%`),
        ilike(MathProblemTable.content, `%${search.trim()}%`),
      )
    : undefined;

  const sortByMap: Record<MathProblemSortByOptionType, SQL<unknown>> = {
    most_recent: desc(MathProblemTable.createdAt),
    oldest: asc(MathProblemTable.createdAt),
    most_used: desc(usageInThreads),
  };

  const mathProblems = await db
    .select({
      ...getTableColumns(MathProblemTable),
      totalUsageInThreads: usageInThreads,
    })
    .from(MathProblemTable)
    .leftJoin(
      ThreadMathProblemTable,
      eq(ThreadMathProblemTable.mathProblemId, MathProblemTable.id),
    )
    .where(and(eq(MathProblemTable.userId, userId), searchFilter))
    .groupBy(MathProblemTable.id)
    .orderBy(sortByMap[sortBy])
    .offset(offset)
    .limit(limit);

  const [mathProblemCount] = await db
    .select({
      total: count(),
    })
    .from(MathProblemTable)
    .where(and(eq(MathProblemTable.userId, userId), searchFilter));

  const hasPrevPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < mathProblemCount.total;

  return {
    mathProblems,
    metadata: {
      hasPrevPage,
      hasNextPage,
    },
  };
};
