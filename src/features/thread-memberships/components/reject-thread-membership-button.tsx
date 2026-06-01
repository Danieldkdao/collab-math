"use client";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useConfirm } from "@/hooks/use-confirm";
import { useThreadMembershipActionStore } from "@/store/use-thread-membership-action-store";
import { useRouter } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import { toast } from "sonner";
import { updateThreadMembershipAction } from "../actions/actions";

export const RejectThreadMembershipButton = ({
  threadId,
  children,
  disabled,
  ...props
}: { threadId: string; children: ReactNode } & ComponentProps<
  typeof Button
>) => {
  const router = useRouter();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Confirm Invitation Rejection",
    "Are you sure you want to reject this invitation? The thread owner will have to resend an invitation if you want to join.",
  );
  const { isPending, setIsPending } = useThreadMembershipActionStore();

  const handleAcceptThreadMembership = async () => {
    const confirmation = await confirm();
    if (!confirmation) return;

    setIsPending(true);

    const response = await updateThreadMembershipAction(threadId, {
      status: "rejected",
    });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success("Invitation rejected successfully!");
      router.refresh();
    }

    setIsPending(false);
  };

  return (
    <>
      {ConfirmationDialog}
      <Button
        {...props}
        disabled={isPending || disabled}
        onClick={handleAcceptThreadMembership}
      >
        <LoadingSwap isLoading={isPending}>{children}</LoadingSwap>
      </Button>
    </>
  );
};
