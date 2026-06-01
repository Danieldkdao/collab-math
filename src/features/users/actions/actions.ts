"use server";

import { cacheTag } from "next/cache";
import { getUserGlobalTag } from "../server/cache/users";
import { db } from "@/db/db";
import { user } from "@/db/schema";
import { PAGE_SIZE } from "@/lib/constants";
import { and, asc, eq, ilike, not } from "drizzle-orm";

export const getUsersAction = async (
  page: number,
  search?: string,
  excludeCurrentUser?: string | null,
) => {
  "use cache";
  cacheTag(getUserGlobalTag());

  const offset = page * PAGE_SIZE;

  const users = await db
    .select()
    .from(user)
    .where(
      and(
        search?.trim() ? ilike(user.name, `%${search.trim()}%`) : undefined,
        excludeCurrentUser ? not(eq(user.id, excludeCurrentUser)) : undefined,
      ),
    )
    .orderBy(asc(user.name), asc(user.id))
    .offset(offset)
    .limit(PAGE_SIZE);

  return users;
};
