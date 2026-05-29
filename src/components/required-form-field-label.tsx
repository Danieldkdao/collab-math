import { TooltipWrapper } from "./tooltip-wrapper";
import { FieldLabel } from "./ui/field";

export const RequiredFormFieldLabel = ({ label }: { label: string }) => {
  return (
    <TooltipWrapper align="start" content="This field is required.">
      <FieldLabel className="w-fit sm:w-fit">
        {label}
        <span className="text-destructive">*</span>
      </FieldLabel>
    </TooltipWrapper>
  );
};
