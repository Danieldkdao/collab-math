"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { UserAvatar } from "../../user-avatar";
import { Button } from "../../ui/button";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

export const DashboardSidebarUserProfile = () => {
  const { data: session } = useAuthSession();

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full min-w-0">
        <Button
          variant="outline"
          className="flex w-full min-w-0 shrink items-center gap-4 overflow-hidden whitespace-normal h-18 py-2 px-4"
        >
          <UserAvatar
            name={session.user.name}
            image={session.user.image}
            className="size-10"
            textClassName="text-xl font-medium"
          />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden">
            <span className="block w-full truncate text-left text-lg font-semibold">
              {session.user.name}
            </span>
            <span className="block w-full truncate text-left text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" alignOffset={75}>
        <div className="flex flex-col gap-0.5 p-2">
          <span className="text-lg font-semibold ">{session.user.name}</span>
          <span className="text-muted-foreground">{session.user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
