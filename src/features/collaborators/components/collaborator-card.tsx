"use client";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/lib/auth/auth";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const CollaboratorCard = ({
  collaborator,
}: {
  collaborator: {
    collaboratorId: string;
    user: User;
    totalCollaborations: number;
  };
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <UserAvatar
            {...collaborator.user}
            className="size-14"
            textClassName="text-2xl font-medium"
          />
          <span className="text-3xl font-semibold">
            {collaborator.user.name}
          </span>
        </div>
        <TooltipWrapper content="Click to copy">
          <div
            className={cn(
              "cursor-pointer break-all flex items-center gap-2 transition-opacity duration-300",
              copied && "cursor-not-allowed opacity-80",
            )}
            onClick={async () => {
              if (copied) return;
              try {
                await navigator.clipboard.writeText(collaborator.user.email);
                setCopied(true);
                toast.success("Email copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
              } catch (error) {
                toast.error("Failed to copy to clipboard.");
              }
            }}
          >
            {copied ? (
              <>
                <CheckIcon className="size-5 text-secondary" />
                <span className="text-secondary text-lg font-medium">
                  Copied
                </span>
              </>
            ) : (
              <span className="text-lg text-muted-foreground font-medium">
                {collaborator.user.email}
              </span>
            )}
          </div>
        </TooltipWrapper>
        <Badge className="self-end mt-2">
          {collaborator.totalCollaborations}{" "}
          {collaborator.totalCollaborations === 1
            ? "collaboration"
            : "collaborations"}
        </Badge>
      </CardContent>
    </Card>
  );
};
