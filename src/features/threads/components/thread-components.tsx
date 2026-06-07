import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { getThreadsAction } from "../actions/actions";
import { loadThreadSearchParams } from "../lib/params";
import { ThreadSearchParamsType } from "../lib/types";
import { ThreadFilters } from "./thread-filters";
import { ThreadInfiniteCardList } from "./thread-infinite-card-list";

export const ThreadsLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-full sm:w-40" />
          <Skeleton className="h-9 w-full sm:w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full">
        {Array.from({ length: 4 }).map((_, index) => (
          <ThreadsCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const ThreadsCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="flex min-w-0 flex-col md:flex-row md:items-center gap-4">
        <div className="flex min-w-0 flex-col gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-full max-w-96" />
            <Skeleton className="h-7 w-24 shrink-0" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-full md:w-42 shrink-0" />
      </CardContent>
    </Card>
  );
};

export const ThreadsSuspense = async ({
  publicThreads = false,
  searchParams,
}: ThreadSearchParamsType & { publicThreads?: boolean }) => {
  const filters = await loadThreadSearchParams(searchParams);

  const { userId } = await getCurrentUser();

  const { metadata, threads } = await getThreadsAction(
    {
      ...filters,
      page: DEFAULT_PAGE,
    },
    userId,
    publicThreads,
  );
  const listKey = threads
    .map(
      (thread) =>
        `${thread.id}:${thread.updatedAt.getTime()}:${thread.totalCollaborators}:${thread.totalComments}`,
    )
    .join(",");

  return (
    <div className="flex flex-col gap-6">
      <ThreadFilters />
      <ThreadInfiniteCardList
        key={`${filters.search}:${filters.sortBy}:${filters.filterBy}:${listKey}`}
        userId={userId}
        initialThreads={threads}
        initialHasNextPage={metadata.hasNextPage}
        publicThreads={publicThreads}
      />
    </div>
  );
};
