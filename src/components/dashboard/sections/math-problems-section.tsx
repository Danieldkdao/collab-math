import { getUserMathProblemsAction } from "@/features/math-problems/actions/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { DashboardCardSection } from "../dashboard-card-section";
import { BoxIcon, SquareFunctionIcon } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Fragment, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { DashboardNoData } from "../dashboard-no-data";
import { Skeleton } from "@/components/ui/skeleton";

export const MathProblemsSection = () => {
  return (
    <Suspense fallback={<MathProblemsSectionLoading />}>
      <MathProblemsSectionSuspense />
    </Suspense>
  );
};

const MathProblemsSectionLoading = () => {
  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-5 w-14" />
        </>
      }
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Fragment key={index}>
          <div className="flex items-center justify-between flex-wrap gap-2 w-full min-w-0 p-5">
            <div className="flex items-center gap-2 w-full min-w-0">
              <Skeleton className="size-12 shrink-0 rounded-md" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <Skeleton className="h-6 w-full max-w-72" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-7 w-32 shrink-0 rounded-md" />
            </div>
          </div>
          <Separator className="last:hidden" />
        </Fragment>
      ))}
    </DashboardCardSection>
  );
};

const MathProblemsSectionSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const { mathProblems } = await getUserMathProblemsAction(
    userId,
    { page: DEFAULT_PAGE, search: "", sortBy: "most_recent" },
    3,
  );

  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <BoxIcon className="text-primary" />
            <h2 className="text-2xl font-semibold">Math Problems</h2>
          </div>
          <Link
            href="/dashboard/math-problems"
            className="text-sm text-primary cursor-pointer hover:underline"
          >
            View all
          </Link>
        </>
      }
    >
      {mathProblems.length ? (
        mathProblems.map((mathProblem) => (
          <Fragment key={mathProblem.id}>
            <div className="flex items-center justify-between flex-wrap gap-2 w-full min-w-0 p-5">
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="rounded-md bg-background dark:bg-muted size-12 flex items-center justify-center">
                  <SquareFunctionIcon />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <MarkdownRenderer variant="subheading2">
                    {mathProblem.title}
                  </MarkdownRenderer>
                  <span className="text-base font-medium">
                    Updated{" "}
                    {mathProblem.updatedAt.toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {mathProblem.updatedAt.getDate()}
                  </span>
                </div>
                <Badge variant="outline">
                  Used in {mathProblem.totalUsageInThreads}{" "}
                  {mathProblem.totalUsageInThreads === 1 ? "thread" : "threads"}
                </Badge>
              </div>
            </div>
            <Separator className="last:hidden" />
          </Fragment>
        ))
      ) : (
        <DashboardNoData
          title="No Math Problems"
          description="You haven't created any math problems yet. Once you create one, it will appear here."
        />
      )}
    </DashboardCardSection>
  );
};
