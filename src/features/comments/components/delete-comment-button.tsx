"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { usePendingActionStore } from "@/store/use-pending-action-store";
import { deleteCommentAction } from "../actions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import { LoadingSwap } from "@/components/ui/loading-swap";

export const DeleteCommentButton = ({
  commentId,
  threadId,
  afterAction,
  children,
  onClick,
  disabled,
  ...props
}: {
  commentId: string;
  threadId: string;
  children: ReactNode;
  afterAction?: () => void;
} & ComponentProps<typeof Button>) => {
  const router = useRouter();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Confirm Deletion",
    "Are you sure you want to delete this comment? This action will remove this comment along with all sub-comments and cannot be undone.",
  );
  const { isPending, setIsPending } = usePendingActionStore();

  const handleDeleteComment = async () => {
    const confirmation = await confirm();
    if (!confirmation) return;

    setIsPending(true);

    const response = await deleteCommentAction(commentId, threadId);
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
      router.refresh();
      afterAction?.();
    }

    setIsPending(false);
  };

  return (
    <>
      {ConfirmationDialog}
      <Button
        disabled={isPending || disabled}
        onClick={handleDeleteComment}
        {...props}
      >
        <LoadingSwap isLoading={isPending}>{children}</LoadingSwap>
      </Button>
    </>
  );
};
