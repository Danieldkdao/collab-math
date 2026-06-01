import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "../helpers";
import { ThreadTable } from "./thread";
import { user } from "./user";

export const CommentTable = pgTable("comment", {
  id,
  threadId: uuid("thread_id")
    .references(() => ThreadTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),
  message: text("message").notNull(),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const commentRelations = relations(CommentTable, ({ one, many }) => ({
  thread: one(ThreadTable, {
    fields: [CommentTable.id],
    references: [ThreadTable.id],
  }),
  user: one(user, {
    fields: [CommentTable.userId],
    references: [user.id],
  }),
  comments: many(CommentTable),
}));
