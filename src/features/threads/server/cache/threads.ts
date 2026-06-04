import { getIdTag, getUserIdResourceTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

// export const getThreadGlobalTag = () => {
//   return getGlobalTag("threads");
// };

export const getThreadIdTag = (threadId: string) => {
  return getIdTag("threads", threadId);
};

export const getUserThreadTag = (userId: string) => {
  return getUserIdResourceTag("threads", userId);
};

export const revalidateThreadCache = (threadId: string, userId: string) => {
  // revalidateTag(getThreadGlobalTag(), { expire: 0 });
  revalidateTag(getThreadIdTag(threadId), { expire: 0 });
  revalidateTag(getUserThreadTag(userId), { expire: 0 });
};
