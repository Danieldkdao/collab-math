import { AlertWrapper } from "@/components/alert-wrapper";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadMembershipTable,
  ThreadTable,
  user,
} from "@/db/schema";
import { ThreadCommentList } from "@/features/comments/components/thread-comment-list";
import { checkUserThreadPermissions } from "@/features/thread-memberships/lib/permissions";
import { User } from "@/lib/auth/auth";
import {
  ArrowLeftIcon,
  EditIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { ThreadViewMathProblemsList } from "./thread-view-math-problems-list";
import { UpdateThreadDialog } from "./update-thread-dialog";
import { CreateUpdateCommentForm } from "@/features/comments/components/create-update-comment-form";
import { DeleteThreadButton } from "./delete-thread-button";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { STARTING_LEVEL } from "@/features/comments/lib/constants";
import Link from "next/link";

export const ThreadIdView = async ({
  thread,
  currentUserId,
}: {
  thread: typeof ThreadTable.$inferSelect & {
    user: typeof user.$inferSelect;
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
  };
  currentUserId?: string | null;
}) => {
  return (
    <div className="w-full min-w-0 flex flex-col gap-4">
      <Button variant="ghost" className="self-start" asChild>
        <Link href="/threads">
          <ArrowLeftIcon />
          Back to threads
        </Link>
      </Button>
      {!(await checkUserThreadPermissions(currentUserId, thread.id, [
        "can_comment",
      ])) && (
        <AlertWrapper
          title="Limited Access"
          description="You are currently in view-only mode. This means that you can view the content, but are unable to participate in discussions and other interactives related to this thread. To unlock these, accept the thread membership sent to you by the thread owner."
          icon={TriangleAlertIcon}
          variant="warning"
        />
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex items-center w-full min-w-0">
              <MarkdownRenderer variant="title" className="flex-1">
                {thread.title}
              </MarkdownRenderer>

              {currentUserId === thread.userId && (
                <div className="flex items-center gap-2">
                  <UpdateThreadDialog
                    existingThread={thread}
                    tooltipContent="Edit thread"
                  >
                    <Button size="icon" variant="outline">
                      <EditIcon />
                    </Button>
                  </UpdateThreadDialog>
                  <TooltipWrapper content="Delete thread">
                    <DeleteThreadButton
                      threadId={thread.id}
                      size="icon"
                      variant="destructive"
                    >
                      <Trash2Icon />
                    </DeleteThreadButton>
                  </TooltipWrapper>
                </div>
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
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <MarkdownRenderer>{thread.description}</MarkdownRenderer>
            </TabsContent>
            <TabsContent value="comments" className="flex flex-col gap-4 pt-4">
              <ThreadCommentList
                threadId={thread.id}
                nestedLevel={STARTING_LEVEL}
              />
              <CreateUpdateCommentForm threadId={thread.id} />
            </TabsContent>
            <TabsContent value="problems">
              <ThreadViewMathProblemsList threadId={thread.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
