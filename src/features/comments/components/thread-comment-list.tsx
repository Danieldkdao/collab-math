import { MessageSquareXIcon } from "lucide-react";
import { Suspense } from "react";
import { getThreadComments } from "../actions/actions";
import { Comment } from "./comment";
import { getCurrentUser } from "@/lib/auth/helpers";

export const ThreadCommentList = (props: {
  threadId: string;
  commentId?: string;
  nestedLevel: number;
}) => {
  return (
    <Suspense fallback={<ThreadCommentListLoading />}>
      <ThreadCommentListSuspense {...props} />
    </Suspense>
  );
};

const ThreadCommentListLoading = () => {
  return <div>loading</div>;
};

const ThreadCommentListSuspense = async ({
  threadId,
  commentId,
  nestedLevel,
}: {
  threadId: string;
  commentId?: string;
  nestedLevel: number;
}) => {
  const { userId } = await getCurrentUser();
  const comments = await getThreadComments(threadId, commentId);

  if (!comments || comments.length === 0)
    return (
      <div className="flex flex-col gap-4">
        <div className="p-5 flex flex-col items-center gap-1 rounded-md border-4 border-border border-dashed">
          <MessageSquareXIcon className="size-10" />
          <h2 className="text-xl font-semibold text-center">No comments yet</h2>
          <p className="text-base text-muted-foreground text-center">
            Looks like there are no comments in this thread yet. Be the first to
            start the conversation.
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col w-full gap-4">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            nestedLevel={nestedLevel}
            currentUserId={userId}
          />
        ))}
      </div>
    </div>
  );
};
