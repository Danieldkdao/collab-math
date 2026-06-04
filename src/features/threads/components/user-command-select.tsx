"use client";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Badge } from "@/components/ui/badge";
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
import { UserAvatar } from "@/components/user-avatar";
import { getThreadMembershipStatusBadgeVariants } from "@/features/thread-memberships/lib/formatters";
import { getUsersAction } from "@/features/users/actions/actions";
import { useAuthSession } from "@/hooks/use-auth-session";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, Loader2Icon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThreadCollaboratorSchemaType } from "../actions/schemas";

type UserCommandSelectProps = {
  values: ThreadCollaboratorSchemaType[];
  onChange: (value: ThreadCollaboratorSchemaType) => void;
};

export const UserCommandSelect = ({
  values,
  onChange,
}: UserCommandSelectProps) => {
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
    queryKey: ["users", session?.user.id, debouncedSearch[0]],
    queryFn: ({ pageParam }) =>
      getUsersAction(pageParam, debouncedSearch[0], session?.user.id),
    enabled: !!session?.user.id,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.metadata.hasNextPage) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data]);

  const fetchMoreUsersIfNeeded = useCallback(() => {
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

    const animationFrame = requestAnimationFrame(fetchMoreUsersIfNeeded);

    return () => cancelAnimationFrame(animationFrame);
  }, [fetchMoreUsersIfNeeded, open, users.length]);

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
          fetchMoreUsersIfNeeded();
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
  }, [open, fetchMoreUsersIfNeeded, hasNextPage]);

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
            {values.length} users selected
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <ChevronsUpDownIcon />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {values.map((user) => {
            const {
              variant,
              icon: Icon,
              text,
            } = getThreadMembershipStatusBadgeVariants(user.status);
            return (
              <div
                key={user.id}
                className="w-full flex items-center min-w-0 gap-2 py-4"
              >
                <UserAvatar {...user} />
                <span className="flex-1 min-w-0 truncate">{user.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={variant}>
                    <Icon />
                    {text}
                  </Badge>
                  <TooltipWrapper content="Remove user">
                    <Button
                      variant="destructive"
                      type="button"
                      size="icon"
                      onClick={() => onChange(user)}
                    >
                      <XIcon />
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={(value) => setSearch(value)}
            placeholder="Search by name..."
          />
          <CommandList ref={commandListRef} onScroll={fetchMoreUsersIfNeeded}>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <div className="flex flex-col gap-2">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.id}`}
                    onSelect={() =>
                      onChange({
                        id: user.id,
                        name: user.name,
                        image: user.image,
                        status: "pending",
                      })
                    }
                    className={cn(
                      "p-4",
                      values.map((p) => p.id).includes(user.id) &&
                        "bg-primary/30! hover:bg-primary/20! data-selected:bg-primary/20!",
                    )}
                  >
                    <UserAvatar {...user} />
                    <span className="text-base">{user.name}</span>
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
