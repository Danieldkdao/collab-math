import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../helpers";
import { ThreadTable } from "./thread";
import { user } from "./user";
import { relations } from "drizzle-orm";

export const CommentTable = pgTable("comment", {
  id,
  threadId: uuid("thread_id")
    .references(() => ThreadTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),
  message: text("message").notNull(),
  createdAt,
  updatedAt,
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
