"use client";

import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { CommentTable } from "@/db/schemas/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCommentAction, updateCommentAction } from "../actions/actions";
import {
  createUpdateCommentSchema,
  CreateUpdateCommentSchemaType,
} from "../actions/schemas";

export const CreateUpdateCommentForm = ({
  threadId,
  existingComment,
  parentId,
}: {
  threadId: string;
  existingComment?: typeof CommentTable.$inferSelect;
  parentId?: string;
}) => {
  const router = useRouter();
  const form = useForm<CreateUpdateCommentSchemaType>({
    resolver: zodResolver(createUpdateCommentSchema),
    defaultValues: {
      message: existingComment?.message ?? "",
    },
  });

  const handleCreateUpdateComment = async (
    data: CreateUpdateCommentSchemaType,
  ) => {
    const action = existingComment
      ? updateCommentAction(existingComment.id, threadId, data)
      : createCommentAction(threadId, data, parentId);
    const response = await action;
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
      form.reset();
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleCreateUpdateComment)}
      className="w-full flex flex-col gap-4"
    >
      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => (
          <Field>
            <FieldContent>
              <MarkdownEditor
                value={field.value}
                height={200}
                onChange={field.onChange}
                variant="transparent"
              />
            </FieldContent>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="w-full flex justify-end">
        <Button size="icon" disabled={form.formState.isSubmitting}>
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            <SendIcon />
          </LoadingSwap>
        </Button>
      </div>
    </form>
  );
};
