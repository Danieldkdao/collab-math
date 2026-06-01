import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../helpers";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { ThreadMathProblemTable } from "./thread-math-problem";
import { ThreadMembershipTable } from "./thread-membership";
import { CommentTable } from "./comment";

export const ThreadTable = pgTable("threads", {
  id,
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  isPublic: boolean("is_public").notNull(),
  createdAt,
  updatedAt,
});

export const threadRelations = relations(ThreadTable, ({ one, many }) => ({
  user: one(user, {
    fields: [ThreadTable.userId],
    references: [user.id],
  }),
  mathProblems: many(ThreadMathProblemTable),
  memberships: many(ThreadMembershipTable),
  comments: many(CommentTable),
}));
