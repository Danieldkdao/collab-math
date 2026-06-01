type CacheTag =
  | "users"
  | "threads"
  | "math_problems"
  | "thread_memberships"
  | "comments";

export const getGlobalTag = (tag: CacheTag) => {
  return `global:${tag}` as const;
};

export const getIdTag = (tag: CacheTag, id: string) => {
  return `${tag}:${id}` as const;
};

export const getUserIdResourceTag = (tag: CacheTag, userId: string) => {
  return `user:${userId}:${tag}` as const;
};

export const getThreadIdResourceTag = (tag: CacheTag, threadId: string) => {
  return `thread:${threadId}:${tag}` as const;
};
