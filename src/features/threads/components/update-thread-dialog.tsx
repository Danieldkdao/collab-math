"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadMembershipTable,
  ThreadTable,
} from "@/db/schema";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { CreateUpdateThreadForm } from "./create-update-thread-form";
import { User } from "@/lib/auth/auth";

type UpdateThreadDialogProps = {
  existingThread: typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
  };
  children: ReactNode;
  tooltipContent?: ReactNode;
};

export const UpdateThreadDialog = ({
  existingThread,
  children,
  tooltipContent,
}: UpdateThreadDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const trigger = tooltipContent ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div onClick={() => setOpen(true)}>{children}</div>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  ) : (
    <DialogTrigger asChild>{children}</DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Update Thread Details</DialogTitle>
          <DialogDescription className="sr-only">
            Form to update thread details.
          </DialogDescription>
        </DialogHeader>
        <CreateUpdateThreadForm
          existingThread={existingThread}
          doAfterAction={() => {
            router.refresh();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
