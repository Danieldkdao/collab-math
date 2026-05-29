import { db } from "@/db/db";
import { ThreadTable } from "@/db/schema";
import { revalidateThreadCache } from "./cache/threads";
import { and, eq } from "drizzle-orm";

export const insertThreadDb = async (
  threadData: typeof ThreadTable.$inferInsert,
) => {
  const [insertedThread] = await db
    .insert(ThreadTable)
    .values(threadData)
    .returning();

  revalidateThreadCache(insertedThread.id, insertedThread.userId);

  return insertedThread;
};

export const updateThreadDb = async (
  threadId: string,
  userId: string,
  threadData: Partial<typeof ThreadTable.$inferSelect>,
) => {
  const [updatedThread] = await db
    .update(ThreadTable)
    .set(threadData)
    .where(and(eq(ThreadTable.id, threadId), eq(ThreadTable.userId, userId)))
    .returning();

  revalidateThreadCache(updatedThread.id, updatedThread.userId);

  return updatedThread;
};
