import {
  getGlobalTag,
  getIdTag,
  getThreadIdResourceTag,
  getUserIdResourceTag,
} from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

const getMathProblemGlobalTag = () => {
  return getGlobalTag("math_problems");
};

export const getMathProblemIdTag = (mathProblemId: string) => {
  return getIdTag("math_problems", mathProblemId);
};

export const getUserMathProblemTag = (userId: string) => {
  return getUserIdResourceTag("math_problems", userId);
};

export const getThreadMathProblemTag = (threadId: string) => {
  return getThreadIdResourceTag("math_problems", threadId);
};

export const revalidateMathProblemCache = (
  mathProblemId: string,
  userId: string,
) => {
  revalidateTag(getMathProblemGlobalTag(), { expire: 0 });
  revalidateTag(getMathProblemIdTag(mathProblemId), { expire: 0 });
  revalidateTag(getUserMathProblemTag(userId), { expire: 0 });
};

export const revalidateThreadMathProblemCache = (threadId: string) => {
  revalidateTag(getThreadMathProblemTag(threadId), { expire: 0 });
};
