import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadTable,
  user,
} from "@/db/schema";
import { EditIcon } from "lucide-react";
import { UpdateThreadDialog } from "./update-thread-dialog";
import { ThreadViewMathProblemsList } from "./thread-view-math-problems-list";

export const ThreadIdView = async ({
  thread,
  currentUserId,
}: {
  thread: typeof ThreadTable.$inferSelect & {
    user: typeof user.$inferSelect;
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
  };
  currentUserId: string;
}) => {
  return (
    <div className="w-full min-w-0">
      <Card>
        <CardContent className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex items-center w-full min-w-0">
              <MarkdownRenderer variant="title" className="flex-1">
                {thread.title}
              </MarkdownRenderer>
              {currentUserId === thread.userId && (
                <UpdateThreadDialog
                  existingThread={thread}
                  tooltipContent="Edit thread"
                >
                  <EditIcon />
                </UpdateThreadDialog>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <UserAvatar {...thread.user} />
              <span className="text-base">
                <span className="font-medium">{thread.user.name}</span> started
                this thread on {thread.createdAt.toDateString()}
              </span>
            </div>
          </div>
          <Tabs defaultValue="description">
            <TabsList className="w-full">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <MarkdownRenderer>{thread.description}</MarkdownRenderer>
            </TabsContent>
            <TabsContent value="conversations"></TabsContent>
            <TabsContent value="problems">
              <ThreadViewMathProblemsList
                problems={thread.mathProblems.map((p) => p.mathProblem)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
