import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThreadMembershipTable, ThreadTable } from "@/db/schema";
import {
  ArrowRightIcon,
  GlobeIcon,
  LockIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import Link from "next/link";
import { getThreadMembershipStatusBadgeVariants } from "../lib/formatters";
import { AcceptThreadMembershipButton } from "./accept-thread-membership-button";
import { RejectThreadMembershipButton } from "./reject-thread-membership-button";

export const ThreadMembershipCard = ({
  threadMembershipData,
}: {
  threadMembershipData: typeof ThreadMembershipTable.$inferSelect & {
    thread: typeof ThreadTable.$inferSelect;
  };
}) => {
  const { thread, ...threadMembership } = threadMembershipData;
  const threadMembershipStatus = threadMembership.status;

  const {
    text,
    icon: Icon,
    variant,
  } = getThreadMembershipStatusBadgeVariants(threadMembershipStatus);

  const getThreadMembershipCardButtons = () => {
    switch (threadMembershipStatus) {
      case "accepted":
        return (
          <>
            <Button className="w-full" asChild>
              <Link href={`/dashboard/threads/${thread.id}`}>
                Open Thread
                <ArrowRightIcon />
              </Link>
            </Button>
          </>
        );
      case "pending":
        return (
          <>
            <AcceptThreadMembershipButton
              threadId={thread.id}
              className="w-full"
            >
              Accept
            </AcceptThreadMembershipButton>
            <RejectThreadMembershipButton
              threadId={thread.id}
              className="w-full"
              variant="destructive"
            >
              Reject
            </RejectThreadMembershipButton>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/threads/${thread.id}`} target="_blank">
                <SquareArrowOutUpRightIcon />
                View Thread
              </Link>
            </Button>
          </>
        );
      case "rejected":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg font-medium text-muted-foreground italic text-center">
              You rejected this invitation.
            </span>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="flex gap-4">
        <div className="flex-1 h-full flex flex-col">
          <div className="flex-1 h-full flex flex-col gap-2">
            <div className="flex items-center gap-2 w-full justify-between">
              <MarkdownRenderer variant="title" className="w-full">
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
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {thread.isPublic ? <GlobeIcon /> : <LockIcon />}
              <span className="font-medium text-lg">
                {thread.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <span className="text-muted-foreground font-medium text-lg">•</span>
            <span className="text-muted-foreground font-medium text-lg">
              {threadMembership.respondedAt ? "Responded" : "Invited"}{" "}
              {threadMembership.respondedAt
                ? threadMembership.respondedAt.toDateString()
                : threadMembership.createdAt.toDateString()}
            </span>
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-2 w-full max-w-60 min-h-35">
          {getThreadMembershipCardButtons()}
        </div>
      </CardContent>
    </Card>
  );
};
