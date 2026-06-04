"use server";

import { cacheTag } from "next/cache";
import { getUserGlobalTag } from "../server/cache/users";
import { db } from "@/db/db";
import { user } from "@/db/schema";
import { PAGE_SIZE } from "@/lib/constants";
import { and, asc, count, eq, ilike, not } from "drizzle-orm";

export const getUsersAction = async (
  page: number,
  search?: string,
  excludeCurrentUser?: string | null,
) => {
  "use cache";
  cacheTag(getUserGlobalTag());

  const offset = page * PAGE_SIZE;
  const usersWhere = and(
    search?.trim() ? ilike(user.name, `%${search.trim()}%`) : undefined,
    excludeCurrentUser ? not(eq(user.id, excludeCurrentUser)) : undefined,
  );

  const users = await db
    .select()
    .from(user)
    .where(usersWhere)
    .orderBy(asc(user.name), asc(user.id))
    .offset(offset)
    .limit(PAGE_SIZE);

  const [usersTotal] = await db
    .select({
      total: count(),
    })
    .from(user)
    .where(usersWhere);

  return {
    users,
    metadata: {
      hasPrevPage: page > 0,
      hasNextPage: (page + 1) * PAGE_SIZE < usersTotal.total,
    },
  };
};
