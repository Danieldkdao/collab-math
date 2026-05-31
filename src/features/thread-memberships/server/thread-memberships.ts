import { db } from "@/db/db";
import { ThreadMembershipTable } from "@/db/schema";
import { and, eq, ExtractTablesWithRelations, inArray } from "drizzle-orm";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";
import { revalidateThreadMembershipCache } from "./cache/thread-memberships";

export const upsertThreadMembershipsDb = async (
  threadId: string,
  userIds: string[],
  tx?: PgTransaction<
    NeonQueryResultHKT,
    typeof import("/Users/danieldao/Desktop/collab-math/src/db/schema"),
    ExtractTablesWithRelations<
      typeof import("/Users/danieldao/Desktop/collab-math/src/db/schema")
    >
  >,
) => {
  const insertedThreadMemberships = await (tx ?? db)
    .insert(ThreadMembershipTable)
    .values(userIds.map((userId) => ({ threadId, userId })))
    .onConflictDoUpdate({
      target: [ThreadMembershipTable.userId, ThreadMembershipTable.threadId],
      set: {
        status: "pending",
      },
    })
    .returning();

  insertedThreadMemberships.forEach((membership) => {
    revalidateThreadMembershipCache(membership.userId, membership.threadId);
  });

  return insertedThreadMemberships;
};

export const deleteThreadMembershipsDb = async (
  threadId: string,
  userIds: string[],
  tx?: PgTransaction<
    NeonQueryResultHKT,
    typeof import("/Users/danieldao/Desktop/collab-math/src/db/schema"),
    ExtractTablesWithRelations<
      typeof import("/Users/danieldao/Desktop/collab-math/src/db/schema")
    >
  >,
) => {
  const deletedThreadMemberships = await (tx ?? db)
    .delete(ThreadMembershipTable)
    .where(
      and(
        eq(ThreadMembershipTable.threadId, threadId),
        inArray(ThreadMembershipTable.userId, userIds),
        eq(ThreadMembershipTable.status, "pending"),
      ),
    )
    .returning();

  deletedThreadMemberships.forEach((membership) => {
    revalidateThreadMembershipCache(membership.userId, membership.threadId);
  });

  return deletedThreadMemberships;
};
