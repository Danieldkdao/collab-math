"use client";

import { MathProblemTable } from "@/db/schema";
import { DEFAULT_PAGE } from "@/lib/constants";
import { useEffect, useRef, useState, useTransition } from "react";
import { useMathProblemParams } from "../hooks/use-math-problem-params";
import { getUserMathProblemsAction } from "../actions/actions";
import { Loader2Icon } from "lucide-react";
import { SearchNotFound } from "@/components/search-not-found";
import { MathProblemCard } from "./math-problem-card";

export const UserMathProblemInfiniteCardList = ({
  userId,
  initialMathProblems,
  initialHasNextPage,
}: {
  userId: string;
  initialMathProblems: (typeof MathProblemTable.$inferSelect & {
    totalUsageInThreads: number;
  })[];
  initialHasNextPage: boolean;
}) => {
  const [filters] = useMathProblemParams();
  const [mathProblems, setMathProblems] = useState(initialMathProblems);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMathProblems(initialMathProblems);
    setPage(DEFAULT_PAGE);
    setHasNextPage(initialHasNextPage);
  }, [initialMathProblems, initialHasNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isPending) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        startTransition(async () => {
          const nextPage = page + 1;

          const { mathProblems, metadata } = await getUserMathProblemsAction(
            userId,
            { ...filters, page: nextPage },
          );
          setMathProblems((prev) => [...prev, ...mathProblems]);
          setPage(nextPage);
          setHasNextPage(metadata.hasNextPage);
        });
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filters, page, hasNextPage, isPending]);

  return mathProblems.length ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 w-full">
        {mathProblems.map((mathProblem) => (
          <MathProblemCard key={mathProblem.id} mathProblem={mathProblem} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isPending && (
          <Loader2Icon className="animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  ) : (
    <SearchNotFound subject="math problems" />
  );
};
