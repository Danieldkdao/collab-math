import { getGlobalTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getUserGlobalTag = () => {
  return getGlobalTag("users");
};

export const revalidateUserCache = () => {
  revalidateTag(getUserGlobalTag(), { expire: 0 });
};
