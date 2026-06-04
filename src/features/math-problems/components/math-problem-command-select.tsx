"use client";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ThreadMathProblemSchemaType } from "@/features/threads/actions/schemas";
import { useAuthSession } from "@/hooks/use-auth-session";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ChevronsUpDownIcon,
  FunctionSquareIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserMathProblemsAction } from "../actions/actions";

type MathProblemCommandSelectProps = {
  values: ThreadMathProblemSchemaType[];
  onChange: (value: ThreadMathProblemSchemaType) => void;
};

export const MathProblemCommandSelect = ({
  values,
  onChange,
}: MathProblemCommandSelectProps) => {
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pendingFetchRef = useRef(false);

  const { data: session } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, {
    wait: 300,
  });
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["mathProblems", session?.user.id, debouncedSearch[0]],
    queryFn: ({ pageParam }) =>
      getUserMathProblemsAction(session?.user.id ?? "", {
        page: pageParam,
        search: debouncedSearch[0],
        sortBy: "most_recent",
      }),
    enabled: !!session?.user.id,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.metadata.hasNextPage) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

  const mathProblems = useMemo(() => {
    return data?.pages.flatMap((page) => page.mathProblems) ?? [];
  }, [data]);

  const fetchMoreMathProblemsIfNeeded = useCallback(() => {
    const root = commandListRef.current;

    if (!open) return;
    if (!root) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    if (pendingFetchRef.current) return;

    const distanceFromBottom =
      root.scrollHeight - root.scrollTop - root.clientHeight;

    if (distanceFromBottom <= 64) {
      pendingFetchRef.current = true;
      fetchNextPage().finally(() => {
        pendingFetchRef.current = false;
      });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, open]);

  useEffect(() => {
    if (!open) return;

    const animationFrame = requestAnimationFrame(fetchMoreMathProblemsIfNeeded);

    return () => cancelAnimationFrame(animationFrame);
  }, [fetchMoreMathProblemsIfNeeded, open, mathProblems.length]);

  useEffect(() => {
    if (!open) return;

    const root = commandListRef.current;
    const node = loadMoreRef.current;

    if (!root) return;
    if (!node) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMoreMathProblemsIfNeeded();
        }
      },
      {
        root,
        rootMargin: "64px",
        threshold: 0,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [open, fetchMoreMathProblemsIfNeeded, hasNextPage]);

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <Collapsible>
        <div className="flex items-center gap-2 min-w-0">
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="w-full flex-1 min-w-0 truncate"
            type="button"
          >
            {values.length} math problems selected
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <ChevronsUpDownIcon />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {values.map((problem) => (
            <div
              key={problem.id}
              className="w-full flex items-center min-w-0 gap-2 py-4"
            >
              <FunctionSquareIcon />
              <span className="flex-1 min-w-0 truncate">{problem.title}</span>
              <TooltipWrapper content="Remove problem">
                <Button
                  variant="destructive"
                  type="button"
                  size="icon"
                  onClick={() => onChange(problem)}
                >
                  <XIcon />
                </Button>
              </TooltipWrapper>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={(search) => setSearch(search)}
            placeholder="Search by title..."
          />
          <CommandList
            ref={commandListRef}
            onScroll={fetchMoreMathProblemsIfNeeded}
          >
            <CommandEmpty>No math problems found.</CommandEmpty>
            <CommandGroup>
              <div className="flex flex-col gap-2">
                {mathProblems.map((problem) => (
                  <CommandItem
                    key={problem.id}
                    value={problem.title}
                    onSelect={() => onChange(problem)}
                    className={cn(
                      "p-4",
                      values.map((p) => p.id).includes(problem.id) &&
                        "bg-primary/30! hover:bg-primary/20! data-selected:bg-primary/20!",
                    )}
                  >
                    <FunctionSquareIcon className="size-5" />
                    <span className="text-base">{problem.title}</span>
                  </CommandItem>
                ))}
                <div ref={loadMoreRef} className="h-1 bg-transparent w-full" />
              </div>

              {(isLoading || isFetchingNextPage) && (
                <div className="w-full flex justify-center">
                  <Loader2Icon className="text-primary animate-spin" />
                </div>
              )}
              {error && (
                <div className="w-full border-2 border-destructive border-dashed rounded-md p-5 bg-destructive/30 flex flex-col gap-0.5">
                  <span className="text-lg font-semibold text-center text-destructive">
                    Something went wrong.
                  </span>
                  <span className="text-base font-semibold text-center text-destructive">
                    We were unable to fetch your data at this time. Try
                    refreshing the page or coming back later.
                  </span>
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};
