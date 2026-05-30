"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { CreateUpdateThreadForm } from "./create-update-thread-form";

export const CreateThreadDialog = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Create Thread</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new thread.
          </DialogDescription>
        </DialogHeader>
        <CreateUpdateThreadForm
          doAfterAction={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
