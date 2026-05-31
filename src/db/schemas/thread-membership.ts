import { relations } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt } from "../helpers";
import { ThreadMembershipStatusEnum } from "../shared";
import { ThreadTable } from "./thread";
import { user } from "./user";

export const ThreadMembershipTable = pgTable(
  "thread_memberships",
  {
    threadId: uuid("thread_id")
      .references(() => ThreadTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    status: ThreadMembershipStatusEnum("status").notNull().default("pending"),
    createdAt,
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.threadId] })],
);

export const threadMembershipRelations = relations(
  ThreadMembershipTable,
  ({ one }) => ({
    thread: one(ThreadTable, {
      fields: [ThreadMembershipTable.threadId],
      references: [ThreadTable.id],
    }),
    user: one(user, {
      fields: [ThreadMembershipTable.userId],
      references: [user.id],
    }),
  }),
);
