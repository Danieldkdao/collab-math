import { CreateUpdateMathProblemDialog } from "@/features/math-problems/components/create-update-math-problem-dialog";
import { Button } from "../ui/button";
import { MessageSquarePlusIcon, SigmaIcon } from "lucide-react";
import { CreateThreadDialog } from "@/features/threads/components/create-thread-dialog";
import { CardsSection } from "./sections/cards-section";
import { RecentThreadsSection } from "./sections/recent-threads-section";
import { MathProblemsSection } from "./sections/math-problems-section";
import { TopCollaboratorsSection } from "./sections/top-collaborators-section";
import { MembershipsSection } from "./sections/memberships-section";

export const DashboardView = () => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col @xl:flex-row @xl:items-center gap-4 @xl:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your math discussions, math problems, collaborators, and
            invitations in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateUpdateMathProblemDialog>
            <Button variant="outline">
              <SigmaIcon />
              New Math Problem
            </Button>
          </CreateUpdateMathProblemDialog>
          <CreateThreadDialog>
            <Button>
              <MessageSquarePlusIcon />
              New Thread
            </Button>
          </CreateThreadDialog>
        </div>
      </div>
      <CardsSection />
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <RecentThreadsSection />
          <MathProblemsSection />
        </div>
        <div className="flex flex-col gap-4">
          <MembershipsSection />
          <TopCollaboratorsSection />
        </div>
      </div>
    </div>
  );
};
