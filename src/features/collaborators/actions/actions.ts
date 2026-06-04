"use server";

import { getUserThreadMembershipTag } from "@/features/thread-memberships/server/cache/thread-memberships";
import { cacheTag } from "next/cache";
import { CollaboratorSortByOptionType } from "../lib/params";
import { db } from "@/db/db";
import { ThreadMembershipTable, ThreadTable, user } from "@/db/schema";
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  ilike,
  max,
  min,
  ne,
  or,
  sql,
  SQL,
} from "drizzle-orm";
import { PAGE_SIZE } from "@/lib/constants";

export const getCollaboratorsAction = async (
  userId: string,
  filterOptions: {
    search: string;
    sortBy: CollaboratorSortByOptionType;
    page: number;
  },
) => {
  "use cache";
  cacheTag(getUserThreadMembershipTag(userId));

  const { search, sortBy, page } = filterOptions;

  const offset = (page - 1) * PAGE_SIZE;

  const collaboratorId = sql<string>`
    CASE
      WHEN ${ThreadTable.userId} = ${userId}
        THEN ${ThreadMembershipTable.userId}
      ELSE ${ThreadTable.userId}
    END
  `.as("collaborator_id");

  const collaborationRows = db
    .select({
      collaboratorId,
      threadId: ThreadMembershipTable.threadId,
      threadTitle: ThreadTable.title,
      respondedAt: ThreadMembershipTable.respondedAt,
    })
    .from(ThreadMembershipTable)
    .innerJoin(ThreadTable, eq(ThreadTable.id, ThreadMembershipTable.threadId))
    .where(
      and(
        eq(ThreadMembershipTable.status, "accepted"),
        or(
          eq(ThreadTable.userId, userId),
          eq(ThreadMembershipTable.userId, userId),
        ),
        ne(ThreadTable.userId, ThreadMembershipTable.userId),
      ),
    )
    .as("collaboration_rows");

  const latestCollaboration = max(collaborationRows.respondedAt);
  const oldestCollaboration = min(collaborationRows.respondedAt);
  const collaborationCount = countDistinct(collaborationRows.threadId);
  const searchFilter = search.trim()
    ? or(
        ilike(user.name, `%${search.trim()}%`),
        ilike(collaborationRows.threadTitle, `%${search.trim()}%`),
      )
    : undefined;

  const sortByMap: Record<CollaboratorSortByOptionType, SQL<unknown>> = {
    most_recent: desc(latestCollaboration),
    oldest: asc(oldestCollaboration),
    most_collaborations: desc(collaborationCount),
  };

  const collaborators = await db
    .select({
      collaboratorId: collaborationRows.collaboratorId,
      user: getTableColumns(user),
      totalCollaborations: collaborationCount,
    })
    .from(collaborationRows)
    .innerJoin(user, eq(user.id, collaborationRows.collaboratorId))
    .where(searchFilter)
    .groupBy(
      collaborationRows.collaboratorId,
      user.id,
      user.name,
      user.email,
      user.emailVerified,
      user.image,
      user.createdAt,
      user.updatedAt,
    )
    .orderBy(sortByMap[sortBy])
    .offset(offset)
    .limit(PAGE_SIZE);

  const [collaboratorsTotal] = await db
    .select({
      total: countDistinct(collaborationRows.collaboratorId),
    })
    .from(collaborationRows)
    .innerJoin(user, eq(user.id, collaborationRows.collaboratorId))
    .where(searchFilter);

  const hasPrevPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < collaboratorsTotal.total;

  return {
    collaborators,
    metadata: {
      hasPrevPage,
      hasNextPage,
    },
  };
};
