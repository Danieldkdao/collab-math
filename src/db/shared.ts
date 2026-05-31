import { pgEnum } from "drizzle-orm/pg-core";

export const threadMembershipStatuses = [
  "pending",
  "accepted",
  "rejected",
] as const;
export type ThreadMembershipStatus = (typeof threadMembershipStatuses)[number];
export const ThreadMembershipStatusEnum = pgEnum(
  "thread_membership_statuses",
  threadMembershipStatuses,
);
