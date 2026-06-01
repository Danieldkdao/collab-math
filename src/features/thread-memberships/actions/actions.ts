"use server";

import { db } from "@/db/db";
import {
  ThreadMembershipStatus,
  ThreadMembershipTable,
  ThreadTable,
} from "@/db/schema";
import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  NOT_FOUND_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import { PAGE_SIZE } from "@/lib/constants";
import { SortByOptionsType } from "@/lib/types";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  SQL,
} from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getUserThreadMembershipTag } from "../server/cache/thread-memberships";
import { updateThreadMembershipDb } from "../server/thread-memberships";
import {
  updateThreadMembershipSchema,
  UpdateThreadMembershipSchemaType,
} from "./schemas";

export const getUserThreadMembershipsAction = async (
  userId: string,
  filterOptions: {
    search: string;
    sortBy: SortByOptionsType;
    membershipStatuses: ThreadMembershipStatus[];
    page: number;
  },
) => {
  "use cache";
  cacheTag(getUserThreadMembershipTag(userId));

  const offset = (filterOptions.page - 1) * PAGE_SIZE;

  const sortByMap: Record<SortByOptionsType, SQL<unknown>> = {
    most_recent: desc(ThreadMembershipTable.createdAt),
    oldest: asc(ThreadMembershipTable.createdAt),
  };

  const threadMemberships = await db
    .select({
      ...getTableColumns(ThreadMembershipTable),
      thread: getTableColumns(ThreadTable),
    })
    .from(ThreadMembershipTable)
    .innerJoin(ThreadTable, eq(ThreadTable.id, ThreadMembershipTable.threadId))
    .where(
      and(
        eq(ThreadMembershipTable.userId, userId),
        filterOptions.membershipStatuses.length
          ? inArray(
              ThreadMembershipTable.status,
              filterOptions.membershipStatuses,
            )
          : undefined,
        filterOptions.search.trim()
          ? ilike(ThreadTable.title, `%${filterOptions.search.trim()}%`)
          : undefined,
      ),
    )
    .orderBy(sortByMap[filterOptions.sortBy])
    .offset(offset)
    .limit(PAGE_SIZE);

  const [totalThreadMemberships] = await db
    .select({
      total: count(),
    })
    .from(ThreadMembershipTable)
    .where(eq(ThreadMembershipTable.userId, userId));

  const hasPrevPage = filterOptions.page > 1;
  const hasNextPage =
    threadMemberships.length * filterOptions.page <
    totalThreadMemberships.total;

  return {
    threadMemberships,
    metadata: {
      hasNextPage,
      hasPrevPage,
    },
  };
};

export const updateThreadMembershipAction = async (
  threadId: string,
  unsafeData: UpdateThreadMembershipSchemaType,
) => {
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

  const { data, success } = updateThreadMembershipSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: INVALID_DATA_ERROR_MESSAGE,
    };
  }

  try {
    const updatedThreadMembership = await updateThreadMembershipDb(
      existingThread.id,
      userId,
      data,
    );

    if (!updatedThreadMembership) {
      throw new Error("Failed to update thread membership.");
    }

    return {
      error: false,
      message: "Thread membership updated successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: GENERAL_ERROR_MESSAGE,
    };
  }
};
