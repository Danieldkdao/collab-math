import { authClient } from "@/lib/auth/auth-client";
import { useSyncExternalStore } from "react";

export const useAuthSession = () => {
  return useSyncExternalStore(
    (callback) => authClient.useSession.subscribe(() => callback()),
    () => authClient.useSession.get(),
    () => authClient.useSession.get(),
  );
};
