import { db, type DbTransaction } from "@/db/db";
import { ThreadMembershipTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { revalidateThreadMembershipCache } from "./cache/thread-memberships";
import { revalidateThreadCache } from "@/features/threads/server/cache/threads";

export const updateThreadMembershipDb = async (
  threadId: string,
  userId: string,
  data: Partial<typeof ThreadMembershipTable.$inferSelect>,
) => {
  const [updatedThreadMembership] = await db
    .update(ThreadMembershipTable)
    .set(data)
    .where(
      and(
        eq(ThreadMembershipTable.userId, userId),
        eq(ThreadMembershipTable.threadId, threadId),
      ),
    )
    .returning();

  revalidateThreadMembershipCache(
    updatedThreadMembership.userId,
    updatedThreadMembership.threadId,
  );
  revalidateThreadCache(
    updatedThreadMembership.threadId,
    updatedThreadMembership.userId,
  );

  return updatedThreadMembership;
};

export const upsertThreadMembershipsDb = async (
  threadId: string,
  userIds: ({ userId: string } & Partial<
    Omit<typeof ThreadMembershipTable.$inferSelect, "threadId" | "userId">
  >)[],
  tx?: DbTransaction,
) => {
  const insertedThreadMemberships = await (tx ?? db)
    .insert(ThreadMembershipTable)
    .values(
      userIds.map(({ userId, ...fields }) => ({
        threadId,
        userId,
        ...fields,
      })),
    )
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
  tx?: DbTransaction,
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
