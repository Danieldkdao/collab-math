import {
  ThreadsLoading,
  ThreadsSuspense,
} from "@/features/threads/components/thread-components";
import { ThreadSearchParamsType } from "@/features/threads/lib/types";
import { Suspense } from "react";

const UserThreadsPage = (props: ThreadSearchParamsType) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-4xl font-semibold">Your Threads</h1>
      <Suspense fallback={<ThreadsLoading />}>
        <ThreadsSuspense {...props} />
      </Suspense>
    </div>
  );
};

export default UserThreadsPage;
