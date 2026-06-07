import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CommentTable } from "@/db/schema";
import { User } from "@/lib/auth/auth";
import { ChevronDownIcon } from "lucide-react";
import { MAX_NESTED_LEVEL } from "../lib/constants";
import { checkUserCommentPermissions } from "../lib/permissions";
import { CommentActions } from "./comment-actions";
import { CreateUpdateCommentForm } from "./create-update-comment-form";
import { ThreadCommentList } from "./thread-comment-list";

export const Comment = async ({
  comment,
  nestedLevel,
  currentUserId,
}: {
  comment: typeof CommentTable.$inferSelect & {
    user: User | null;
    comments: (typeof CommentTable.$inferSelect)[];
  };
  nestedLevel: number;
  currentUserId?: string | null;
}) => {
  return (
    <div key={comment.id} className="flex flex-col gap-1">
      <CommentActions
        comment={comment}
        canUpdate={await checkUserCommentPermissions(
          currentUserId,
          comment.threadId,
          comment.id,
          ["update"],
        )}
        canDelete={await checkUserCommentPermissions(
          currentUserId,
          comment.threadId,
          comment.id,
          ["delete"],
        )}
      />
      {nestedLevel <= MAX_NESTED_LEVEL && comment.status !== "deleted" && (
        <Collapsible className="flex flex-col gap-4">
          <CollapsibleTrigger className="group flex items-center gap-2 cursor-pointer">
            <span>Reply ({comment.comments.length})</span>
            <ChevronDownIcon className="size-4 group-data-[state=open]:rotate-180 transition-transform duration-300" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-4 border-l-2 flex flex-col gap-4">
              <ThreadCommentList
                threadId={comment.threadId}
                commentId={comment.id}
                nestedLevel={nestedLevel + 1}
              />
              <CreateUpdateCommentForm
                threadId={comment.threadId}
                parentId={comment.id}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
