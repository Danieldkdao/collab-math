"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ComponentProps, ReactNode, useTransition } from "react";
import { deleteThreadAction } from "../actions/actions";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

export const DeleteThreadButton = ({
  threadId,
  children,
  onClick,
  disabled,
  ...props
}: { threadId: string; children: ReactNode } & ComponentProps<
  typeof Button
>) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Confirm Deletion",
    "Are you sure that you want to delete this thread? This action cannot be undone and all data (excluding math problems and users) related to this thread will be permanently erased.",
  );

  const handleDeleteThread = async () => {
    if (isPending) return;
    const confirmation = await confirm();
    if (!confirmation) return;

    startTransition(async () => {
      const response = await deleteThreadAction(threadId);
      if (response.error) {
        toast.error(response.message);
      } else {
        toast.success(response.message);
        if (pathname === "/dashboard/threads") {
          router.refresh();
        } else {
          router.push("/dashboard/threads");
        }
      }
    });
  };

  return (
    <>
      {ConfirmationDialog}
      <Button
        disabled={isPending || disabled}
        onClick={handleDeleteThread}
        {...props}
      >
        <LoadingSwap isLoading={isPending}>{children}</LoadingSwap>
      </Button>
    </>
  );
};
