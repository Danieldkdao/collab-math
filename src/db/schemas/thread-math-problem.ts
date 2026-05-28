import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { ThreadTable } from "./thread";
import { MathProblemTable } from "./math-problem";
import { relations } from "drizzle-orm";

export const ThreadMathProblemTable = pgTable(
  "thread_math_problems",
  {
    threadId: uuid("thread_id")
      .references(() => ThreadTable.id, { onDelete: "cascade" })
      .notNull(),
    mathProblemId: uuid("math_problem_id")
      .references(() => MathProblemTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.threadId, t.mathProblemId] })],
);

export const threadMathProblemRelations = relations(
  ThreadMathProblemTable,
  ({ one }) => ({
    thread: one(ThreadTable, {
      fields: [ThreadMathProblemTable.threadId],
      references: [ThreadTable.id],
    }),
    mathProblem: one(MathProblemTable, {
      fields: [ThreadMathProblemTable.mathProblemId],
      references: [MathProblemTable.id],
    }),
  }),
);
