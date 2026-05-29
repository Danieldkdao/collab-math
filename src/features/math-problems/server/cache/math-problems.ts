import { getGlobalTag, getIdTag, getUserIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getMathProblemGlobalTag = () => {
  return getGlobalTag("math_problems");
};

export const getMathProblemIdTag = (mathProblemId: string) => {
  return getIdTag("math_problems", mathProblemId);
};

export const getUserMathProblemTag = (userId: string) => {
  return getUserIdTag("math_problems", userId);
};

export const revalidateMathProblemCache = (
  mathProblemId: string,
  userId: string,
) => {
  revalidateTag(getMathProblemGlobalTag(), { expire: 0 });
  revalidateTag(getMathProblemIdTag(mathProblemId), { expire: 0 });
  revalidateTag(getUserMathProblemTag(userId), { expire: 0 });
};
