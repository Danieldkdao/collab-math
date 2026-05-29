import z from "zod";

export const threadCreationUpdateSchema = z.object({
  title: z.string().trim().min(1, { error: "Please enter a title." }),
  description: z
    .string()
    .trim()
    .min(10, { error: "Please enter at least 10 characters." }),
});
export type ThreadCreationUpdateSchemaType = z.infer<
  typeof threadCreationUpdateSchema
>;
