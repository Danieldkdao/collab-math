import z from "zod";

export const threadMathProblemSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
});
export type ThreadMathProblemSchemaType = z.infer<
  typeof threadMathProblemSchema
>;

export const threadCreationUpdateSchema = z.object({
  title: z.string().trim().min(1, { error: "Please enter a title." }),
  description: z
    .string()
    .trim()
    .min(10, { error: "Please enter at least 10 characters." }),
  mathProblems: z.array(threadMathProblemSchema),
});
export type ThreadCreationUpdateSchemaType = z.infer<
  typeof threadCreationUpdateSchema
>;
