"use client";

import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { UserAvatar } from "@/components/user-avatar";
import { CommentTable } from "@/db/schema";
import { User } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { CreateUpdateCommentForm } from "./create-update-comment-form";
import { usePendingActionStore } from "@/store/use-pending-action-store";
import { DeleteCommentButton } from "./delete-comment-button";
import { formatCommentStatus } from "../lib/formatters";

export const CommentActions = ({
  comment,
  canUpdate,
  canDelete,
}: {
  comment: typeof CommentTable.$inferSelect & {
    user: User | null;
  };
  canUpdate: boolean;
  canDelete: boolean;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isPending = usePendingActionStore((state) => state.isPending);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap w-full min-w-0">
        <div className="flex items-center gap-2 flex-1 w-full min-w-0">
          <div className="flex items-center gap-2">
            <UserAvatar
              name={comment.user?.name ?? "Anonymous"}
              image={comment.user?.image}
            />
            <span className="text-lg font-medium truncate">
              {comment.user?.name ?? "Anonymous"}
            </span>
          </div>
          <span className="text-lg font-medium text-muted-foreground">•</span>
          <span className="text-lg font-medium text-muted-foreground">
            {(comment.status === "created"
              ? comment.createdAt
              : comment.lastActionAt
            ).toDateString()}{" "}
            {comment.status !== "created" && (
              <span className="italic capitalize">{`(${formatCommentStatus(comment.status)})`}</span>
            )}
          </span>
        </div>
        <div className="flex items-center ga-2">
          {canUpdate && comment.status !== "deleted" && (
            <TooltipWrapper content="Edit comment">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUpdating(true)}
                disabled={isPending}
              >
                <PenSquareIcon />
              </Button>
            </TooltipWrapper>
          )}
          {canDelete && comment.status !== "deleted" && (
            <TooltipWrapper content="Delete comment">
              <DeleteCommentButton
                commentId={comment.id}
                threadId={comment.threadId}
                variant="destructive"
                disabled={isUpdating}
              >
                <Trash2Icon />
              </DeleteCommentButton>
            </TooltipWrapper>
          )}
        </div>
      </div>

      {isUpdating ? (
        <CreateUpdateCommentForm
          threadId={comment.threadId}
          parentId={comment.parentId}
          existingComment={comment}
          afterSubmit={() => {
            setIsUpdating(false);
          }}
        />
      ) : (
        <MarkdownRenderer className="[&_p]:text-muted-foreground!">
          {comment.status === "deleted"
            ? `*${comment.message}*`
            : comment.message}
        </MarkdownRenderer>
      )}
    </div>
  );
};
