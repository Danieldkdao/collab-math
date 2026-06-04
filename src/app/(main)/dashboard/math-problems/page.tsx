import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserMathProblemsAction } from "@/features/math-problems/actions/actions";
import { UserMathProblemFilters } from "@/features/math-problems/components/user-math-problem-filters";
import { UserMathProblemInfiniteCardList } from "@/features/math-problems/components/user-math-problem-infinite-card-list";
import { loadMathProblemSearchParams } from "@/features/math-problems/lib/params";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { SearchParams } from "nuqs";
import { Suspense } from "react";

type UserMathProblemsParams = { searchParams: Promise<SearchParams> };

const UserMathProblemsPage = (props: UserMathProblemsParams) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-4xl font-semibold">Your Math Problems</h1>
      <Suspense fallback={<UserMathProblemsLoading />}>
        <UserMathProblemsSuspense {...props} />
      </Suspense>
    </div>
  );
};

const UserMathProblemsLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-transparent p-2 px-4 shadow-sm dark:bg-input/30 dark:shadow-none">
          <Skeleton className="size-6 shrink-0" />
          <Skeleton className="h-9 flex-1 bg-transparent" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 w-full">
          {Array.from({ length: 3 }).map((_, index) => (
            <UserMathProblemCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserMathProblemCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Skeleton className="hidden md:inline size-6 shrink-0" />
          <Skeleton className="h-9 w-full max-w-120" />
          <Skeleton className="h-7 w-36 shrink-0" />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 shrink-0" />
            <Skeleton className="h-7 w-44" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 shrink-0" />
            <Skeleton className="h-7 w-40" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-between">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="size-6 shrink-0" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2 justify-end border-t">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-14" />
      </CardFooter>
    </Card>
  );
};

const UserMathProblemsSuspense = async ({
  searchParams,
}: UserMathProblemsParams) => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const filters = await loadMathProblemSearchParams(searchParams);

  const { mathProblems, metadata } = await getUserMathProblemsAction(userId, {
    ...filters,
    page: DEFAULT_PAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <UserMathProblemFilters />
      <UserMathProblemInfiniteCardList
        key={`${filters.search}:${filters.sortBy}`}
        userId={userId}
        initialMathProblems={mathProblems}
        initialHasNextPage={metadata.hasNextPage}
      />
    </div>
  );
};

export default UserMathProblemsPage;
