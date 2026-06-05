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
import { MathProblemTable } from "@/db/schema";
import { useRouter } from "next/navigation";

export const CreateUpdateMathProblemDialog = ({
  children,
  existingMathProblem,
}: {
  children: ReactNode;
  existingMathProblem?: typeof MathProblemTable.$inferSelect;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {existingMathProblem ? "Update" : "Create"} Math Problem
          </DialogTitle>
          <DialogDescription className="sr-only">
            {existingMathProblem
              ? "Form to update a math problem."
              : "Form to create a new math problem."}
          </DialogDescription>
        </DialogHeader>
        <CreateUpdateMathProblemForm
          existingMathProblem={existingMathProblem}
          doAfterAction={() => {
            setOpen(false);
            router.push("/dashboard/math-problems");
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
