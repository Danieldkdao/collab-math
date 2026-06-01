import { threadMembershipStatuses } from "@/db/shared";
import z from "zod";

export const updateThreadMembershipSchema = z.object({
  status: z.enum(threadMembershipStatuses),
});
export type UpdateThreadMembershipSchemaType = z.infer<
  typeof updateThreadMembershipSchema
>;
