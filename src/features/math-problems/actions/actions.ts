"use server";

import {
  GENERAL_ERROR_MESSAGE,
  INVALID_DATA_ERROR_MESSAGE,
  UNAUTHED_ERROR_MESSAGE,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  createUpdateMathProblemSchema,
  CreateUpdateMathProblemSchemaType,
} from "./schemas";
import {
  insertMathProblemDb,
  updateMathProblemDb,
} from "../server/math-problems";
import { cacheTag } from "next/cache";
import { getUserMathProblemTag } from "../server/cache/math-problems";
import { db } from "@/db/db";
import { MathProblemTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export const getUserMathProblemsAction = async (userId: string) => {
  "use cache";
  cacheTag(getUserMathProblemTag(userId));

  const mathProblems = await db
    .select()
    .from(MathProblemTable)
    .where(eq(MathProblemTable.userId, userId));

  return mathProblems;
};
