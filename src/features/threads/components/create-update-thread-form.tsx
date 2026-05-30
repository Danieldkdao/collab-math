"use client";

import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { RequiredFormFieldLabel } from "@/components/required-form-field-label";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadTable,
} from "@/db/schema";
import { inputErrorBorder } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createThreadAction, updateThreadAction } from "../actions/actions";
import {
  threadCreationUpdateSchema,
  ThreadCreationUpdateSchemaType,
} from "../actions/schemas";
import { MathProblemCommandSelect } from "@/features/math-problems/components/math-problem-command-select";

export const CreateUpdateThreadForm = ({
  existingThread,
  doAfterAction,
}: {
  existingThread?: typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
  };
  doAfterAction?: () => void;
}) => {
  const router = useRouter();
  const form = useForm<ThreadCreationUpdateSchemaType>({
    resolver: zodResolver(threadCreationUpdateSchema),
    defaultValues: existingThread
      ? {
          title: existingThread.title,
          description: existingThread.description ?? "",
          mathProblems: existingThread.mathProblems.map((p) => ({
            id: p.mathProblemId,
            title: p.mathProblem.title,
          })),
        }
      : {
          title: "",
          description: "",
          mathProblems: [],
        },
  });

  const { append, remove } = useFieldArray({
    control: form.control,
    name: "mathProblems",
  });
  const mathProblems = form.watch("mathProblems");

  const handleCreateUpdateThread = async (
    data: ThreadCreationUpdateSchemaType,
  ) => {
    const action: Promise<{
      error: boolean;
      message: string;
      threadId?: string;
    }> = existingThread
      ? updateThreadAction(existingThread.id, data)
      : createThreadAction(data);
    const response = await action;
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
      if (response.threadId) {
        router.push(`/dashboard/threads/${response.threadId}`);
      }
      doAfterAction?.();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleCreateUpdateThread)}
      className="w-full flex flex-col gap-4"
    >
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field>
            <RequiredFormFieldLabel label="Title" />
            <FieldContent>
              <Input
                {...field}
                placeholder="Enter a title..."
                className={inputErrorBorder(fieldState.error)}
              />
            </FieldContent>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field>
            <RequiredFormFieldLabel label="Description" />
            <FieldContent>
              <MarkdownEditor value={field.value} onChange={field.onChange} />
            </FieldContent>
            <FieldDescription>
              What is the thread going to be about? What will you discuss?
            </FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field>
        <FieldLabel>Math Problems</FieldLabel>
        <FieldContent>
          <MathProblemCommandSelect
            values={mathProblems}
            onChange={(problem) => {
              const mathProblems = form.getValues("mathProblems");

              const indexOfProblem = mathProblems.findIndex(
                (p) => p.id === problem.id,
              );
              if (indexOfProblem === -1) {
                append(problem);
                toast.success("Math problem added successfully!");
              } else {
                remove(indexOfProblem);
                toast.success("Math problem removed successfully!");
              }
            }}
          />
        </FieldContent>
        <FieldDescription>
          You can select some math problems that are related to this thread. The
          selected problems will show up on the thread page, available to all
          people with viewing access.
        </FieldDescription>
      </Field>

      <Button className="w-full" disabled={form.formState.isSubmitting}>
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          {existingThread ? "Save changes" : "Create Thread"}
        </LoadingSwap>
      </Button>
    </form>
  );
};
