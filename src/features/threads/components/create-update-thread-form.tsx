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
  ThreadMembershipTable,
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
import { UserCommandSelect } from "./user-command-select";
import { User } from "@/lib/auth/auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CreateUpdateThreadForm = ({
  existingThread,
  doAfterAction,
}: {
  existingThread?: typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
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
          isPublic: existingThread.isPublic,
          mathProblems: existingThread.mathProblems.map((p) => ({
            id: p.mathProblemId,
            title: p.mathProblem.title,
          })),
          collaborators: existingThread.memberships.map((c) => ({
            id: c.userId,
            name: c.user.name,
            image: c.user.image,
            status: c.status,
          })),
        }
      : {
          title: "",
          description: "",
          isPublic: false,
          mathProblems: [],
          collaborators: [],
        },
  });

  const { append: appendMathProblem, remove: removeMathProblem } =
    useFieldArray({
      control: form.control,
      name: "mathProblems",
    });
  const mathProblems = form.watch("mathProblems");

  const { append: appendCollaborator, remove: removeCollaborator } =
    useFieldArray({
      control: form.control,
      name: "collaborators",
    });
  const collaborators = form.watch("collaborators");

  const isPublic = form.watch("isPublic");

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
                appendMathProblem(problem);
                toast.success("Math problem added successfully!");
              } else {
                removeMathProblem(indexOfProblem);
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

      <Controller
        control={form.control}
        name="isPublic"
        render={({ field: { value, onChange, ...props } }) => (
          <Label
            htmlFor="public_id"
            className="flex flex-col cursor-pointer gap-2 items-start p-4 border border-border rounded-md bg-background dark:border-input dark:bg-input/30"
          >
            <div className="flex items-center gap-2 justify-between flex-wrap w-full">
              <span className="text-sm font-medium text-foreground">
                Is Public
              </span>
              <Switch
                id="public_id"
                checked={value}
                onCheckedChange={onChange}
                {...props}
              />
            </div>
            <FieldDescription>
              Controls if the thread is public. Public threads are available to
              everyone. It is currently set to being{" "}
              <span className="text-foreground font-semibold">
                {isPublic ? "public" : "private"}
              </span>
              .
            </FieldDescription>
          </Label>
        )}
      />

      {!isPublic && (
        <Field>
          <FieldLabel>Collaborators</FieldLabel>
          <FieldContent>
            <UserCommandSelect
              values={collaborators}
              onChange={(collaborator) => {
                const collaborators = form.getValues("collaborators");

                const indexOfCollaborator = collaborators.findIndex(
                  (c) => c.id === collaborator.id,
                );
                if (indexOfCollaborator === -1) {
                  appendCollaborator(collaborator);
                  toast.success("Collaborator added successfully!");
                } else {
                  removeCollaborator(indexOfCollaborator);
                  toast.success("Collaborator removed successfully!");
                }
              }}
            />
          </FieldContent>
          <FieldDescription>
            Select the people who will have access to this thread. Note that
            simply selecting them here will not immediately grant them access,
            they will receive a membership which they must accept.
          </FieldDescription>
        </Field>
      )}

      <Button className="w-full" disabled={form.formState.isSubmitting}>
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          {existingThread ? "Save changes" : "Create Thread"}
        </LoadingSwap>
      </Button>
    </form>
  );
};
