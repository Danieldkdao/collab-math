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
import { CreateUpdateMathProblemForm } from "./create-update-math-problem-form";

export const CreateMathProblemDialog = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Create Math Problem</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new math problem.
          </DialogDescription>
        </DialogHeader>
        <CreateUpdateMathProblemForm
          doAfterAction={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
