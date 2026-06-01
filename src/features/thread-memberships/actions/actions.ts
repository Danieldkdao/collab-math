"use server";

import { cacheTag } from "next/cache";
import { getUserThreadMembershipTag } from "../server/cache/thread-memberships";
import { db } from "@/db/db";
import {
  ThreadMembershipStatus,
  ThreadMembershipTable,
  ThreadTable,
} from "@/db/schema";
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
import { SortByOptionsType } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/constants";

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
