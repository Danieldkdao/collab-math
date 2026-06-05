"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ComponentProps, ReactNode, useTransition } from "react";
import { deleteMathProblemAction } from "../actions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

export const DeleteMathProblemButton = ({
  mathProblemId,
  onClick,
  children,
  ...props
}: {
  mathProblemId: string;
  onClick?: () => void;
  children: ReactNode;
} & ComponentProps<typeof Button>) => {
  const router = useRouter();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Confirm Deletion",
    "Are you sure you want to delete this math problem? This is action is permanent and cannot be undone. This math problem will disappear from all threads that used it.",
  );
  const [isPending, startTransition] = useTransition();

  const handleMathProblemDeletion = async () => {
    if (isPending) return;
    const confirmation = await confirm();
    if (!confirmation) return;

    startTransition(async () => {
      const response = await deleteMathProblemAction(mathProblemId);
      if (response.error) {
        toast.error(response.message);
      } else {
        toast.success(response.message);
        router.refresh();
      }
    });
  };

  return (
    <>
      {ConfirmationDialog}
      <Button
        disabled={isPending}
        onClick={handleMathProblemDeletion}
        {...props}
      >
        <LoadingSwap isLoading={isPending}>{children}</LoadingSwap>
      </Button>
    </>
  );
};
