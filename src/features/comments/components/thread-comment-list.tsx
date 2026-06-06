import { Suspense } from "react";
import { getThreadComments } from "../actions/actions";
import { CreateUpdateCommentForm } from "./create-update-comment-form";
import { ChevronDownIcon, MessageSquareXIcon } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MAX_NESTED_LEVEL } from "../lib/constants";

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
          <div key={comment.id} className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={comment.user?.name ?? "Anonymous"}
                    image={comment.user?.image}
                  />
                  <span className="text-lg font-medium truncate">
                    {comment.user?.name ?? "Anonymous"}
                  </span>
                </div>
                <span className="text-lg font-medium text-muted-foreground">
                  •
                </span>
                <span className="text-lg font-medium text-muted-foreground">
                  posted on {comment.createdAt.toDateString()}{" "}
                  <span className="italic">
                    {comment.updatedAt && "(Updated)"}
                  </span>
                </span>
              </div>

              <MarkdownRenderer>{comment.message}</MarkdownRenderer>
            </div>
            {nestedLevel <= MAX_NESTED_LEVEL && (
              <Collapsible className="flex flex-col gap-4">
                <CollapsibleTrigger className="group flex items-center gap-2 cursor-pointer">
                  <span>Reply ({comment.comments.length})</span>
                  <ChevronDownIcon className="size-4 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-4 border-l-2 flex flex-col gap-4">
                    <ThreadCommentList
                      threadId={threadId}
                      commentId={comment.id}
                      nestedLevel={nestedLevel + 1}
                    />
                    <CreateUpdateCommentForm
                      threadId={threadId}
                      parentId={comment.id}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
