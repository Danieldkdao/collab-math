import { UserAvatar } from "@/components/user-avatar";
import { getCollaboratorsAction } from "@/features/collaborators/actions/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { DEFAULT_PAGE } from "@/lib/constants";
import { CircleStarIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardCardSection } from "../dashboard-card-section";
import { DashboardNoData } from "../dashboard-no-data";
import { Skeleton } from "@/components/ui/skeleton";

export const TopCollaboratorsSection = () => {
  return (
    <Suspense fallback={<TopCollaboratorsSectionLoading />}>
      <TopCollaboratorsSectionSuspense />
    </Suspense>
  );
};

const TopCollaboratorsSectionLoading = () => {
  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-8 w-52" />
          </div>
          <Skeleton className="h-5 w-14" />
        </>
      }
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 w-full min-w-0 px-5 py-4"
        >
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <Skeleton className="h-6 w-full max-w-56" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </DashboardCardSection>
  );
};

const TopCollaboratorsSectionSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return null;

  const { collaborators } = await getCollaboratorsAction(
    userId,
    { page: DEFAULT_PAGE, search: "", sortBy: "most_collaborations" },
    3,
  );

  return (
    <DashboardCardSection
      headerChildren={
        <>
          <div className="flex items-center gap-2">
            <CircleStarIcon className="text-primary" />
            <h2 className="text-2xl font-semibold">Top Collaborators</h2>
          </div>
          <Link
            href="/dashboard/collaborators"
            className="text-sm text-primary cursor-pointer hover:underline"
          >
            View all
          </Link>
        </>
      }
    >
      {collaborators.length ? (
        collaborators.map((collaborator) => (
          <div
            key={collaborator.collaboratorId}
            className="flex items-center gap-2 w-full min-w-0 px-5 py-4"
          >
            <UserAvatar
              {...collaborator.user}
              className="size-12"
              textClassName="text-xl font-medium"
            />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xl font-semibold truncate">
                {collaborator.user.name}
              </span>
              <span className="text-base font-medium">
                {collaborator.totalCollaborations}{" "}
                {collaborator.totalCollaborations === 1
                  ? "collaboration"
                  : "collaborations"}
              </span>
            </div>
          </div>
        ))
      ) : (
        <DashboardNoData
          title="No collaborators"
          description="You don't have any collaborators yet. Extend an invite to someone from one of your threads to get started."
        />
      )}
    </DashboardCardSection>
  );
};
