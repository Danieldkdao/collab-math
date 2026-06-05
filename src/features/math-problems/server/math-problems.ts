import { db } from "@/db/db";
import { MathProblemTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidateMathProblemCache } from "./cache/math-problems";

export const insertMathProblemDb = async (
  mathProblemData: typeof MathProblemTable.$inferInsert,
) => {
  const [insertedMathProblem] = await db
    .insert(MathProblemTable)
    .values(mathProblemData)
    .returning();

  revalidateMathProblemCache(
    insertedMathProblem.id,
    insertedMathProblem.userId,
  );

  return insertedMathProblem;
};

export const updateMathProblemDb = async (
  mathProblemId: string,
  userId: string,
  mathProblemData: Partial<typeof MathProblemTable.$inferSelect>,
) => {
  const [updatedMathProblem] = await db
    .update(MathProblemTable)
    .set(mathProblemData)
    .where(
      and(
        eq(MathProblemTable.id, mathProblemId),
        eq(MathProblemTable.userId, userId),
      ),
    )
    .returning();

  revalidateMathProblemCache(updatedMathProblem.id, updatedMathProblem.userId);

  return updatedMathProblem;
};

export const deleteMathProblemDb = async (
  userId: string,
  mathProblemId: string,
) => {
  const [deletedMathProblem] = await db
    .delete(MathProblemTable)
    .where(
      and(
        eq(MathProblemTable.userId, userId),
        eq(MathProblemTable.id, mathProblemId),
      ),
    )
    .returning();

  revalidateMathProblemCache(deletedMathProblem.id, deletedMathProblem.userId);

  return deletedMathProblem;
};
