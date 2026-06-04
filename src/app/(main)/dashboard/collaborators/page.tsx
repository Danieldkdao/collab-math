import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCollaboratorsAction } from "@/features/collaborators/actions/actions";
import { CollaboratorFilters } from "@/features/collaborators/components/collaborator-filters";
import { CollaboratorInfiniteCardList } from "@/features/collaborators/components/collaborator-infinite-card-list";
import { loadCollaboratorSearchParams } from "@/features/collaborators/lib/params";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { SearchParams } from "nuqs";
import { Suspense } from "react";

type CollaboratorsParams = {
  searchParams: Promise<SearchParams>;
};

const CollaboratorsPage = (props: CollaboratorsParams) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-4xl font-semibold">Your Collaborators</h1>
      <Suspense fallback={<CollaboratorsLoading />}>
        <CollaboratorsSuspense {...props} />
      </Suspense>
    </div>
  );
};

const CollaboratorsLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-transparent p-2 px-4 shadow-sm dark:bg-input/30 dark:shadow-none">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-9 flex-1 bg-transparent" />
        </div>
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4 w-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <CollaboratorCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CollaboratorCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <Skeleton className="h-9 min-w-0 flex-1" />
        </div>
        <Skeleton className="h-7 w-full" />
        <Skeleton className="mt-2 h-7 w-36 self-end" />
      </CardContent>
    </Card>
  );
};

const CollaboratorsSuspense = async ({ searchParams }: CollaboratorsParams) => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const filters = await loadCollaboratorSearchParams(searchParams);
  const { collaborators, metadata } = await getCollaboratorsAction(userId, {
    ...filters,
    page: DEFAULT_PAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <CollaboratorFilters />
      <CollaboratorInfiniteCardList
        key={`${filters.search}:${filters.sortBy}`}
        userId={userId}
        initialCollaborators={collaborators}
        initialHasNextPage={metadata.hasNextPage}
      />
    </div>
  );
};

export default CollaboratorsPage;
