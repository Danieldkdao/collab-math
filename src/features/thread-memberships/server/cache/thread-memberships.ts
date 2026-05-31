import { getThreadIdResourceTag, getUserIdResourceTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getUserThreadMembershipTag = (userId: string) => {
  return getUserIdResourceTag("thread_memberships", userId);
};

export const getThreadMembershipTag = (threadId: string) => {
  return getThreadIdResourceTag("thread_memberships", threadId);
};

export const revalidateThreadMembershipCache = (
  userId: string,
  threadId: string,
) => {
  revalidateTag(getUserThreadMembershipTag(userId), { expire: 0 });
  revalidateTag(getThreadMembershipTag(threadId), { expire: 0 });
};
