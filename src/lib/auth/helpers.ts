import { headers } from "next/headers";
import { auth } from "./auth";

export const getCurrentUser = async ({ allData = false } = {}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  return {
    userId: session?.user.id,
    user: allData ? session?.user : null,
  };
};
