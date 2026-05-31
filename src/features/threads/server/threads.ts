import { db } from "@/db/db";
import { ThreadMembershipTable, ThreadTable } from "@/db/schema";
import { revalidateThreadCache } from "./cache/threads";
import { and, eq, inArray } from "drizzle-orm";
import { ThreadMathProblemTable } from "@/db/schemas/thread-math-problem";
import {
  deleteThreadMembershipsDb,
  upsertThreadMembershipsDb,
} from "@/features/thread-memberships/server/thread-memberships";

export const insertThreadDb = async (
  threadData: typeof ThreadTable.$inferInsert,
  mathProblemIds: string[],
  collaboratorIds: string[],
) => {
  const insertedThread = await db.transaction(async (tx) => {
    const [insertedThread] = await tx
      .insert(ThreadTable)
      .values(threadData)
      .returning();

    if (!insertedThread) {
      throw new Error("Failed to create thread.");
    }

    const insertedThreadMathProblems = await tx
      .insert(ThreadMathProblemTable)
      .values(
        mathProblemIds.map((mathProblemId) => ({
          threadId: insertedThread.id,
          mathProblemId,
        })),
      )
      .returning();

    if (insertedThreadMathProblems.length !== mathProblemIds.length) {
      throw new Error("Failed to attach math problems.");
    }

    const insertedThreadMemberships = await upsertThreadMembershipsDb(
      insertedThread.id,
      collaboratorIds,
      tx,
    );
    if (insertedThreadMemberships.length !== collaboratorIds.length) {
      throw new Error("Failed to send memberships to collaborators.");
    }

    return insertedThread;
  });

  revalidateThreadCache(insertedThread.id, insertedThread.userId);

  return insertedThread;
};

export const updateThreadDb = async (
  threadId: string,
  userId: string,
  threadData: Partial<typeof ThreadTable.$inferSelect>,
  mathProblemIds: string[],
  collaboratorIds: string[],
) => {
  const updatedThread = await db.transaction(async (tx) => {
    const [updatedThread] = await db
      .update(ThreadTable)
      .set(threadData)
      .where(and(eq(ThreadTable.id, threadId), eq(ThreadTable.userId, userId)))
      .returning();

    if (!updatedThread) {
      throw new Error("Failed to update thread.");
    }

    const existingThreadMathProblems = await tx
      .select()
      .from(ThreadMathProblemTable)
      .where(eq(ThreadMathProblemTable.threadId, updatedThread.id));
    const existingThreadMathProblemIds = existingThreadMathProblems.map(
      (p) => p.mathProblemId,
    );

    const mathProblemIdsToAdd = [
      ...new Set(
        mathProblemIds.filter(
          (id) => !existingThreadMathProblemIds.includes(id),
        ),
      ),
    ];
    const mathProblemIdsToRemove = [
      ...new Set(
        existingThreadMathProblemIds.filter(
          (id) => !mathProblemIds.includes(id),
        ),
      ),
    ];

    const [addedIds, removedIds] = await Promise.all([
      mathProblemIdsToAdd.length
        ? tx
            .insert(ThreadMathProblemTable)
            .values(
              mathProblemIdsToAdd.map((mathProblemId) => ({
                threadId: updatedThread.id,
                mathProblemId,
              })),
            )
            .returning()
        : [],
      mathProblemIdsToRemove.length
        ? tx
            .delete(ThreadMathProblemTable)
            .where(
              and(
                eq(ThreadMathProblemTable.threadId, updatedThread.id),
                inArray(
                  ThreadMathProblemTable.mathProblemId,
                  mathProblemIdsToRemove,
                ),
              ),
            )
            .returning()
        : [],
    ]);

    if (
      addedIds.length !== mathProblemIdsToAdd.length ||
      removedIds.length !== mathProblemIdsToRemove.length
    ) {
      throw new Error("Failed to update math problem connections.");
    }

    const existingThreadMemberships = await db
      .select()
      .from(ThreadMembershipTable)
      .where(eq(ThreadMembershipTable.threadId, updatedThread.id));
    const existingThreadMembershipUserIds = existingThreadMemberships.map(
      (i) => i.userId,
    );

    const userIdsToAdd = [
      ...new Set(
        collaboratorIds.filter(
          (userId) =>
            !existingThreadMembershipUserIds.includes(userId) ||
            existingThreadMemberships.find(
              (i) => i.userId === userId && i.status === "rejected",
            ),
        ),
      ),
    ];

    const userIdsToDelete = [
      ...new Set(
        existingThreadMembershipUserIds.filter(
          (userId) => !collaboratorIds.includes(userId),
        ),
      ),
    ];

    const [upsertedThreadMemberships, deletedThreadMemberships] =
      await Promise.all([
        userIdsToAdd.length
          ? upsertThreadMembershipsDb(updatedThread.id, userIdsToAdd, tx)
          : [],
        userIdsToDelete.length
          ? deleteThreadMembershipsDb(updatedThread.id, userIdsToDelete, tx)
          : [],
      ]);

    if (
      upsertedThreadMemberships.length !== userIdsToAdd.length ||
      deletedThreadMemberships.length !== userIdsToDelete.length
    ) {
      throw new Error("Failed to update collaborator access.");
    }

    return updatedThread;
  });

  revalidateThreadCache(updatedThread.id, updatedThread.userId);

  return updatedThread;
};
