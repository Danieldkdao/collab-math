"use client";

import { Controller, useForm } from "react-hook-form";
import {
  threadCreationUpdateSchema,
  ThreadCreationUpdateSchemaType,
} from "../actions/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThreadTable } from "@/db/schema";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { inputErrorBorder } from "@/lib/utils";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { createThreadAction, updateThreadAction } from "../actions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CreateUpdateThreadForm = ({
  existingThread,
  doAfterAction,
}: {
  existingThread?: typeof ThreadTable.$inferSelect;
  doAfterAction?: () => void;
}) => {
  const router = useRouter();
  const form = useForm<ThreadCreationUpdateSchemaType>({
    resolver: zodResolver(threadCreationUpdateSchema),
    defaultValues: existingThread
      ? {
          title: existingThread.title,
          description: existingThread.description ?? "",
        }
      : {
          title: "",
          description: "",
        },
  });

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
            <FieldLabel>
              Title<span className="text-destructive">*</span>
            </FieldLabel>
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
            <FieldLabel>Description</FieldLabel>
            <FieldContent>
              <MarkdownEditor
                value={field.value ?? ""}
                onChange={(value) =>
                  field.onChange(value.trim() === "" ? undefined : value)
                }
              />
            </FieldContent>
            <FieldDescription>
              What is the thread going to be about? What will you discuss?
            </FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          Create Thread
        </LoadingSwap>
      </Button>
    </form>
  );
};
