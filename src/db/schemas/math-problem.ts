import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../helpers";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { ThreadMathProblemTable } from "./thread-math-problem";

export const MathProblemTable = pgTable("math_problems", {
  id,
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  createdAt,
  updatedAt,
});

export const mathProblemRelations = relations(
  MathProblemTable,
  ({ one, many }) => ({
    user: one(user, {
      fields: [MathProblemTable.userId],
      references: [user.id],
    }),
    threads: many(ThreadMathProblemTable),
  }),
);
