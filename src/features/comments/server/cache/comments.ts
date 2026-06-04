import { getGlobalTag, getThreadIdResourceTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

const getCommentGlobalTag = () => {
  return getGlobalTag("comments");
};

export const getThreadCommentTag = (threadId: string) => {
  return getThreadIdResourceTag("comments", threadId);
};

export const revalidateCommentCache = (threadId: string) => {
  revalidateTag(getCommentGlobalTag(), { expire: 0 });
  revalidateTag(getThreadCommentTag(threadId), { expire: 0 });
};
