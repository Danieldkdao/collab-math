import z from "zod";

export const createUpdateCommentSchema = z.object({
  message: z.string().trim().min(1, { error: "Please enter a comment." }),
});
export type CreateUpdateCommentSchemaType = z.infer<
  typeof createUpdateCommentSchema
>;
