import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserThreadMembershipsAction } from "@/features/thread-memberships/actions/actions";
import { ThreadMembershipFilters } from "@/features/thread-memberships/components/thread-membership-filters";
import { ThreadMembershipsInfiniteCardList } from "@/features/thread-memberships/components/thread-memberships-infinite-card-list";
import { loadThreadMembershipSearchParams } from "@/features/thread-memberships/lib/params";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { SearchParams } from "nuqs";
import { Suspense } from "react";

type UserMembershipsParams = {
  searchParams: Promise<SearchParams>;
};

const UserMembershipsPage = (props: UserMembershipsParams) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-4xl font-semibold">Thread Memberships</h1>
      <Suspense fallback={<UserMembershipsLoading />}>
        <UserMembershipsSuspense {...props} />
      </Suspense>
    </div>
  );
};

const UserMembershipsLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border p-2 px-4 shadow-sm dark:bg-input/30 dark:shadow-none">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-9 flex-1 bg-transparent" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10.5 w-36" />
          <Skeleton className="h-10.5 w-52" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 w-full">
          {Array.from({ length: 3 }).map((_, index) => (
            <UserMembershipCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserMembershipCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="flex gap-4">
        <div className="flex-1 h-full flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 w-full justify-between">
              <Skeleton className="h-8 w-full max-w-120" />
              <Skeleton className="h-7 w-28 shrink-0" />
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="size-1.5 shrink-0 rounded-full" />
            <Skeleton className="h-6 w-52" />
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-2 w-full max-w-60 min-h-35">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

const UserMembershipsSuspense = async ({
  searchParams,
}: UserMembershipsParams) => {
  const filters = await loadThreadMembershipSearchParams(searchParams);

  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const { metadata, threadMemberships } = await getUserThreadMembershipsAction(
    userId,
    { ...filters, page: DEFAULT_PAGE },
  );

  return (
    <div className="flex flex-col gap-6">
      <ThreadMembershipFilters />
      <ThreadMembershipsInfiniteCardList
        key={`${filters.search}:${filters.sortBy}:${filters.membershipStatuses.join(
          ",",
        )}`}
        userId={userId}
        initialHasNextPage={metadata.hasNextPage}
        initialThreadMemberships={threadMemberships}
      />
    </div>
  );
};

export default UserMembershipsPage;
