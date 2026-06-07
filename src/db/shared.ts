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

export const commentStatuses = ["created", "updated", "deleted"] as const;
export type CommentStatusType = (typeof commentStatuses)[number];
export const commentStatusesEnum = pgEnum("comment_statuses", commentStatuses);
