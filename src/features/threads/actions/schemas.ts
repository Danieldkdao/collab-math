import z from "zod";

export const threadCreationUpdateSchema = z.object({
  title: z.string().trim().min(1, { error: "Please enter a title." }),
  description: z
    .string()
    .trim()
    .refine((value) => value === undefined || value.length >= 10, {
      error: "Please enter at least 10 characters.",
    })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});
export type ThreadCreationUpdateSchemaType = z.infer<
  typeof threadCreationUpdateSchema
>;
