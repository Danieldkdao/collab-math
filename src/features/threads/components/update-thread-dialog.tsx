"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ComponentProps, ReactNode, useState } from "react";
import { CreateUpdateThreadForm } from "./create-update-thread-form";
import { ThreadTable } from "@/db/schema";
import { useRouter } from "next/navigation";

type UpdateThreadDialogProps = {
  existingThread: typeof ThreadTable.$inferSelect;
  children: ReactNode;
};

export const UpdateThreadDialog = ({
  existingThread,
  children,
  ...props
}: UpdateThreadDialogProps & ComponentProps<typeof Button>) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>
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
