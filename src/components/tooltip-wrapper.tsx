import { ComponentProps, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const TooltipWrapper = ({
  children,
  content,
  ...props
}: {
  children: ReactNode;
  content: ReactNode;
} & ComponentProps<typeof TooltipContent>) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent {...props}>{content}</TooltipContent>
    </Tooltip>
  );
};
