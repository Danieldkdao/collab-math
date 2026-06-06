"use server";

import { db } from "@/db/db";
import {
  ThreadTable,
  ThreadMembershipTable,
  user,
  MathProblemTable,
} from "@/db/schema";
import { and, count, countDistinct, eq, ne, or, sql } from "drizzle-orm";
import { getCurrentUser } from "./auth/helpers";

export const getDashboardCardData = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

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

  const [collaboratorsCount] = await db
    .select({
      total: countDistinct(collaborationRows.collaboratorId),
    })
    .from(collaborationRows)
    .innerJoin(user, eq(user.id, collaborationRows.collaboratorId));

  const [mathProblemCount] = await db
    .select({
      total: count(),
    })
    .from(MathProblemTable)
    .where(eq(MathProblemTable.userId, userId));

  const [threadMembershipCount] = await db
    .select({
      total: count(),
    })
    .from(ThreadMembershipTable)
    .innerJoin(ThreadTable, eq(ThreadTable.id, ThreadMembershipTable.threadId))
    .where(
      and(
        eq(ThreadMembershipTable.userId, userId),
        eq(ThreadMembershipTable.status, "pending"),
      ),
    );

  const [threadCount] = await db
    .select({
      total: count(),
    })
    .from(ThreadTable)
    .where(eq(ThreadTable.userId, userId));

  return {
    threadCount: threadCount.total,
    mathProblemCount: mathProblemCount.total,
    collaboratorCount: collaboratorsCount.total,
    threadMembershipCount: threadMembershipCount.total,
  };
};
