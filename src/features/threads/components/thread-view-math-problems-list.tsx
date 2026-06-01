import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getThreadMathProblems } from "@/features/math-problems/actions/actions";
import { ChevronsUpDownIcon } from "lucide-react";
import { Suspense } from "react";
import { Fragment } from "react/jsx-runtime";

export const ThreadViewMathProblemsList = (props: { threadId: string }) => {
  return (
    <Suspense fallback={<ThreadViewMathProblemsListLoading />}>
      <ThreadViewMathProblemsListSuspense {...props} />
    </Suspense>
  );
};

const ThreadViewMathProblemsListLoading = () => {
  return <div>loading</div>;
};

const ThreadViewMathProblemsListSuspense = async ({
  threadId,
}: {
  threadId: string;
}) => {
  const { userId } = await getCurrentUser();
  const problems = (await getThreadMathProblems(userId, threadId)) ?? [];

  return problems.length ? (
    <div className="flex flex-col gap-8 w-full min-w-0 mt-4">
      {problems.map((problem) => (
        <Fragment key={problem.id}>
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center w-full min-w-0 cursor-pointer">
              <MarkdownRenderer className="flex-1 text-start text-xl">
                {`### ${problem.title}`}
              </MarkdownRenderer>
              <ChevronsUpDownIcon />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <MarkdownRenderer>{problem.content}</MarkdownRenderer>
            </CollapsibleContent>
          </Collapsible>
          <Separator className="last:hidden" />
        </Fragment>
      ))}
    </div>
  ) : (
    <div className="border-2 border-border border-dashed mt-4 rounded-md bg-muted p-5 flex flex-col items-center">
      <h3 className="text-xl font-semibold text-center">
        No Attached Problems
      </h3>
      <p className="text-center text-muted-foreground max-w-120">
        The owner of this thread has not attached any problems yet.
      </p>
    </div>
  );
};
