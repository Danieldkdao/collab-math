import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThreadTable } from "@/db/schema";
import { MessageSquareMoreIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { getThreadPublicBadgesStyles } from "../lib/formatters";

export const ThreadCard = ({
  thread,
}: {
  thread: typeof ThreadTable.$inferSelect & {
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
          <div className="flex items-center gap-2">
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
        <div className="w-full md:w-42 shrink-0">
          <Button className="w-full" variant="outline" asChild>
            <Link href={`/threads/${thread.id}`}>Open Thread</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
