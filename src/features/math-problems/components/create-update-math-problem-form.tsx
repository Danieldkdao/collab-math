"use client";

import { Controller, useForm } from "react-hook-form";
import {
  createUpdateMathProblemSchema,
  CreateUpdateMathProblemSchemaType,
} from "../actions/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { RequiredFormFieldLabel } from "@/components/required-form-field-label";
import { Input } from "@/components/ui/input";
import { inputErrorBorder } from "@/lib/utils";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { MathProblemTable } from "@/db/schema";
import {
  createMathProblemAction,
  updateMathProblemAction,
} from "../actions/actions";
import { toast } from "sonner";

export const CreateUpdateMathProblemForm = ({
  existingMathProblem,
  doAfterAction,
}: {
  existingMathProblem?: typeof MathProblemTable.$inferSelect;
  doAfterAction?: () => void;
}) => {
  const form = useForm<CreateUpdateMathProblemSchemaType>({
    resolver: zodResolver(createUpdateMathProblemSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleCreateUpdateMathProblem = async (
    data: CreateUpdateMathProblemSchemaType,
  ) => {
    const action = existingMathProblem
      ? updateMathProblemAction(existingMathProblem.id, data)
      : createMathProblemAction(data);
    const response = await action;
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
      doAfterAction?.();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleCreateUpdateMathProblem)}
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
                placeholder="Enter a memorable title..."
                className={inputErrorBorder(fieldState.error)}
              />
            </FieldContent>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="content"
        render={({ field, fieldState }) => (
          <Field>
            <RequiredFormFieldLabel label="Problem Content" />
            <FieldContent>
              <MarkdownEditor value={field.value} onChange={field.onChange} />
            </FieldContent>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button disabled={form.formState.isSubmitting}>
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          {existingMathProblem ? "Save changes" : "Create math problem"}
        </LoadingSwap>
      </Button>
    </form>
  );
};
