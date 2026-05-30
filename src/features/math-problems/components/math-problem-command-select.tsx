"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserMathProblemsAction } from "../actions/actions";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ChevronsUpDownIcon,
  FunctionSquareIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { ThreadMathProblemSchemaType } from "@/features/threads/actions/schemas";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { cn } from "@/lib/utils";

type MathProblemCommandSelectProps = {
  values: ThreadMathProblemSchemaType[];
  onChange: (value: ThreadMathProblemSchemaType) => void;
};

export const MathProblemCommandSelect = ({
  values,
  onChange,
}: MathProblemCommandSelectProps) => {
  const { data: session } = useAuthSession();
  const [open, setOpen] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: [],
    queryFn: () => getUserMathProblemsAction(session?.user.id ?? ""),
  });

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
        <Command>
          <CommandInput placeholder="Search by title..." />
          <CommandList>
            <CommandEmpty>No math problems found.</CommandEmpty>
            <CommandGroup>
              <div className="flex flex-col gap-2">
                {data?.map((problem) => (
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
              </div>

              {isPending && (
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
