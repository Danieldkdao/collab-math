type CacheTag = "threads" | "math_problems" | "collaborators";

export const getGlobalTag = (tag: CacheTag) => {
  return `global:${tag}` as const;
};

export const getIdTag = (tag: CacheTag, id: string) => {
  return `${tag}:${id}` as const;
};

export const getUserIdTag = (tag: CacheTag, userId: string) => {
  return `user:${userId}:${tag}` as const;
};
