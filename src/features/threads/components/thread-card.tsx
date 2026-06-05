import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MathProblemTable,
  ThreadMathProblemTable,
  ThreadMembershipTable,
  ThreadTable,
} from "@/db/schema";
import { MessageSquareMoreIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { getThreadPublicBadgesStyles } from "../lib/formatters";
import { UpdateThreadDialog } from "./update-thread-dialog";
import { User } from "@/lib/auth/auth";
import { DeleteThreadButton } from "./delete-thread-button";

export const ThreadCard = ({
  thread,
}: {
  thread: typeof ThreadTable.$inferSelect & {
    mathProblems: (typeof ThreadMathProblemTable.$inferSelect & {
      mathProblem: typeof MathProblemTable.$inferSelect;
    })[];
    memberships: (typeof ThreadMembershipTable.$inferSelect & { user: User })[];
    totalCollaborators: number;
    totalComments: number;
  };
}) => {
  const {
    text,
    variant,
    icon: Icon,
  } = getThreadPublicBadgesStyles(thread.isPublic);

  return (
    <Card>
      <CardContent className="flex min-w-0 flex-col md:flex-row md:items-center gap-4">
        <div className="flex min-w-0 flex-col gap-4 flex-1">
          <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
            <MarkdownRenderer
              variant="title"
              className="w-auto max-w-full shrink truncate"
            >
              {thread.title}
            </MarkdownRenderer>
            <Badge variant={variant}>
              <Icon />
              {text}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground line-clamp-2">
            {thread.description}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <UsersIcon className="text-muted-foreground" />
              <span className="text-muted-foreground text-base">
                {thread.totalCollaborators}{" "}
                {thread.totalCollaborators === 1
                  ? "collaborator"
                  : "collaborators"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquareMoreIcon className="text-muted-foreground" />
              <span className="text-muted-foreground text-base">
                {thread.totalComments}{" "}
                {thread.totalComments === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-42 shrink-0 flex flex-col gap-2">
          <Button className="w-full" asChild>
            <Link href={`/threads/${thread.id}`}>Open Thread</Link>
          </Button>
          <UpdateThreadDialog existingThread={thread}>
            <Button className="w-full" variant="outline">
              Update
            </Button>
          </UpdateThreadDialog>
          <DeleteThreadButton threadId={thread.id} variant="destructive">
            Delete
          </DeleteThreadButton>
        </div>
      </CardContent>
    </Card>
  );
};
