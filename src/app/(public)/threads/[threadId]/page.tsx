import { getThreadAction } from "@/features/threads/actions/actions";
import { ThreadIdView } from "@/features/threads/components/thread-id-view";
import { getCurrentUser } from "@/lib/auth/helpers";
import { ParamsType } from "@/lib/types";
import { Suspense } from "react";

type ThreadIdParams = ParamsType<"threadId">;

const ThreadIdPage = (props: ThreadIdParams) => {
  return (
    <Suspense fallback={<ThreadLoading />}>
      <ThreadSuspense {...props} />
    </Suspense>
  );
};

const ThreadLoading = () => {
  return <div>loading</div>;
};

const ThreadSuspense = async ({ params }: ThreadIdParams) => {
  const { userId } = await getCurrentUser();
  const { threadId } = await params;

  const thread = await getThreadAction(threadId, userId);
  if (!thread) {
    return <div>resusable thread not found component</div>;
  }

  return <ThreadIdView currentUserId={userId} thread={thread} />;
};

export default ThreadIdPage;
