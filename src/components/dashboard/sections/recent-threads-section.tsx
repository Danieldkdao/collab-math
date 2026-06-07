import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getThreadsAction } from "@/features/threads/actions/actions";
import { getThreadPublicBadgesStyles } from "@/features/threads/lib/formatters";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import {
  MessageSquareMoreIcon,
  MessagesSquareIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Fragment } from "react/jsx-runtime";
import { DashboardCardSection } from "../dashboard-card-section";
import { DashboardNoData } from "../dashboard-no-data";

export const RecentThreadsSection = () => {
  return (
    <Suspense fallback={<RecentThreadsSectionLoading />}>
      <RecentThreadsSectionSuspense />
    </Suspense>
  );
};

const RecentThreadsSectionLoading = () => {
  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-5 w-14" />
        </>
      }
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Fragment key={index}>
          <div className="flex min-w-0 flex-col gap-2 flex-1 p-5">
            <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
              <Skeleton className="h-8 w-full max-w-80" />
              <Skeleton className="h-7 w-20 shrink-0 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
          <Separator className="last:hidden" />
        </Fragment>
      ))}
    </DashboardCardSection>
  );
};

const RecentThreadsSectionSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const { threads } = await getThreadsAction(
    {
      page: DEFAULT_PAGE,
      filterBy: "all",
      search: "",
      sortBy: "most_recent",
    },
    userId,
    false,
    3,
  );

  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <MessagesSquareIcon className="text-primary" />
            <h2 className="text-2xl font-semibold">Recent Threads</h2>
          </div>
          <Link
            href="/dashboard/threads"
            className="text-sm text-primary cursor-pointer hover:underline"
          >
            View all
          </Link>
        </>
      }
    >
      {threads.length ? (
        threads.map((thread) => {
          const {
            text,
            variant,
            icon: Icon,
          } = getThreadPublicBadgesStyles(thread.isPublic);

          return (
            <Fragment key={thread.id}>
              <Link href={`/threads/${thread.id}`}>
                <div className="flex min-w-0 flex-col gap-2 flex-1 p-5">
                  <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
                    <MarkdownRenderer
                      variant="subheading1"
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
                      <UsersIcon className="text-muted-foreground size-5" />
                      <span className="text-muted-foreground text-base">
                        {thread.totalCollaborators}{" "}
                        {thread.totalCollaborators === 1
                          ? "collaborator"
                          : "collaborators"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquareMoreIcon className="text-muted-foreground size-5" />
                      <span className="text-muted-foreground text-base">
                        {thread.totalComments}{" "}
                        {thread.totalComments === 1 ? "comment" : "comments"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Separator className="last:hidden" />
            </Fragment>
          );
        })
      ) : (
        <DashboardNoData
          title="No Threads"
          description="You haven't created any threads yet. Once you create one, it will appear here."
        />
      )}
    </DashboardCardSection>
  );
};
