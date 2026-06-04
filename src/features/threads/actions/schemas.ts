import { threadMembershipStatuses } from "@/db/shared";
import z from "zod";

const threadMathProblemSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
});
export type ThreadMathProblemSchemaType = z.infer<
  typeof threadMathProblemSchema
>;

const threadCollaboratorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().nullish().optional(),
  status: z.enum(threadMembershipStatuses),
});
export type ThreadCollaboratorSchemaType = z.infer<
  typeof threadCollaboratorSchema
>;

export const threadCreationUpdateSchema = z.object({
  title: z.string().trim().min(1, { error: "Please enter a title." }),
  description: z
    .string()
    .trim()
    .min(10, { error: "Please enter at least 10 characters." }),
  isPublic: z.boolean(),
  mathProblems: z.array(threadMathProblemSchema),
  collaborators: z.array(threadCollaboratorSchema),
});
export type ThreadCreationUpdateSchemaType = z.infer<
  typeof threadCreationUpdateSchema
>;
