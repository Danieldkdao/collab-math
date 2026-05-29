import z from "zod";

export const createUpdateMathProblemSchema = z.object({
  title: z.string().trim().min(1, { error: "Please enter a title." }),
  content: z
    .string()
    .trim()
    .min(1, { error: "Please enter the problem content." }),
});
export type CreateUpdateMathProblemSchemaType = z.infer<
  typeof createUpdateMathProblemSchema
>;
