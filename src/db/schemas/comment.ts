import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id } from "../helpers";
import { ThreadTable } from "./thread";
import { user } from "./user";

export const CommentTable = pgTable("comment", {
  id,
  threadId: uuid("thread_id")
    .references(() => ThreadTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references(
    (): AnyPgColumn => CommentTable.id,
    { onDelete: "cascade" },
  ),
  message: text("message").notNull(),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const commentRelations = relations(CommentTable, ({ one, many }) => ({
  thread: one(ThreadTable, {
    fields: [CommentTable.threadId],
    references: [ThreadTable.id],
  }),
  user: one(user, {
    fields: [CommentTable.userId],
    references: [user.id],
  }),
  parent: one(CommentTable, {
    fields: [CommentTable.parentId],
    references: [CommentTable.id],
    relationName: "comment_replies",
  }),
  comments: many(CommentTable, {
    relationName: "comment_replies",
  }),
}));
