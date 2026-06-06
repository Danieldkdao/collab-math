import { getUserThreadMembershipsAction } from "@/features/thread-memberships/actions/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { Suspense } from "react";
import { DashboardCardSection } from "../dashboard-card-section";
import { BellIcon, MessagesSquareIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getThreadMembershipStatusBadgeVariants } from "@/features/thread-memberships/lib/formatters";
import { ThreadMembershipStatus } from "@/db/shared";
import { Button } from "@/components/ui/button";
import { AcceptThreadMembershipButton } from "@/features/thread-memberships/components/accept-thread-membership-button";
import { RejectThreadMembershipButton } from "@/features/thread-memberships/components/reject-thread-membership-button";
import { getThreadPublicBadgesStyles } from "@/features/threads/lib/formatters";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { DashboardNoData } from "../dashboard-no-data";
import { Skeleton } from "@/components/ui/skeleton";

export const MembershipsSection = () => {
  return (
    <Suspense fallback={<MembershipsSectionLoading />}>
      <MembershipsSectionSuspense />
    </Suspense>
  );
};

const MembershipsSectionLoading = () => {
  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-8 w-36" />
          </div>
          <Skeleton className="h-5 w-14" />
        </>
      }
      className="p-4 flex flex-col gap-4"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-4">
          <CardContent className="p-0 flex flex-col gap-3 w-full min-w-0">
            <div className="flex items-center gap-2 w-full min-w-0">
              <Skeleton className="h-6 min-w-0 flex-1" />
              <Skeleton className="h-7 w-24 shrink-0 rounded-md" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="size-1.5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </DashboardCardSection>
  );
};

const MembershipsSectionSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const { threadMemberships } = await getUserThreadMembershipsAction(
    userId,
    {
      page: DEFAULT_PAGE,
      search: "",
      sortBy: "most_recent",
      membershipStatuses: [],
    },
    3,
  );

  const getThreadMembershipClassButtons = (
    status: ThreadMembershipStatus,
    threadId: string,
  ) => {
    switch (status) {
      case "accepted":
        return {
          className: "bg-transparent",
          buttons: () => (
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/threads/${threadId}`}>
                <MessagesSquareIcon />
                Open Thread
              </Link>
            </Button>
          ),
        };
      case "pending":
        return {
          className: "bg-muted",
          buttons: () => (
            <div className="w-full grid grid-cols-1 @xl:grid-cols-2 gap-4">
              <AcceptThreadMembershipButton threadId={threadId}>
                Accept
              </AcceptThreadMembershipButton>
              <RejectThreadMembershipButton
                threadId={threadId}
                variant="destructive"
              >
                Reject
              </RejectThreadMembershipButton>
            </div>
          ),
        };
      case "rejected":
        return {
          className: "bg-transparent opacity-50",
          buttons: () => null,
        };
      default:
        throw new Error(`Unknown membership status: ${status satisfies never}`);
    }
  };

  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <BellIcon className="text-primary" />
            <h2 className="text-2xl font-semibold">Memberships</h2>
          </div>
          <Link
            href="/dashboard/memberships"
            className="text-sm text-primary cursor-pointer hover:underline"
          >
            View all
          </Link>
        </>
      }
      className="p-4 flex flex-col gap-4"
    >
      {threadMemberships.length ? (
        threadMemberships.map((membership) => {
          const { text: publicText, icon: PublicIcon } =
            getThreadPublicBadgesStyles(membership.thread.isPublic);
          const {
            icon: StatusIcon,
            text: statusText,
            variant,
          } = getThreadMembershipStatusBadgeVariants(membership.status);
          const { className, buttons: Buttons } =
            getThreadMembershipClassButtons(
              membership.status,
              membership.thread.id,
            );

          return (
            <Card key={membership.threadId} className={cn("p-4", className)}>
              <CardContent className="p-0 flex flex-col gap-2 w-full min-w-0">
                <div className="flex items-center gap-2 w-full min-w-0">
                  <MarkdownRenderer
                    variant="subheading2"
                    className="min-w-0 flex-1 overflow-hidden [&_p]:truncate"
                  >
                    {membership.thread.title}
                  </MarkdownRenderer>
                  <Badge variant={variant} className="shrink-0">
                    <StatusIcon />
                    {statusText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <PublicIcon className="size-4" />
                    <span className="">{publicText}</span>
                  </div>

                  <span className="text-lg font-medium">•</span>
                  <span>
                    Invited{" "}
                    {(
                      membership.respondedAt ?? membership.createdAt
                    ).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {(membership.respondedAt ?? membership.createdAt).getDate()}
                  </span>
                </div>
                <Buttons />
              </CardContent>
            </Card>
          );
        })
      ) : (
        <DashboardNoData
          title="No memberships"
          description="You haven't received any memberships or invites yet. Once you receive one, it will appear here."
          className="p-0"
        />
      )}
    </DashboardCardSection>
  );
};
