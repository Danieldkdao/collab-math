import { LucideIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { ComponentProps } from "react";

export const AlertWrapper = ({
  title,
  description,
  icon: Icon,
  ...props
}: { title: string; description: string; icon: LucideIcon } & ComponentProps<
  typeof Alert
>) => {
  return (
    <Alert {...props}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};
