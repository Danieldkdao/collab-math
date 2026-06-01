import { ThreadMembershipStatus } from "@/db/shared";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";

export const formatThreadMembershipStatus = (
  status: ThreadMembershipStatus,
) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      throw new Error(
        `Unknown thread membership status: ${status satisfies never}`,
      );
  }
};

export const getThreadMembershipStatusBadgeVariants = (
  status: ThreadMembershipStatus,
) => {
  switch (status) {
    case "accepted":
      return {
        text: formatThreadMembershipStatus("accepted"),
        icon: CheckCircleIcon,
        variant: "outline" as const,
      };
    case "pending":
      return {
        text: formatThreadMembershipStatus("pending"),
        icon: ClockIcon,
        variant: "default" as const,
      };
    case "rejected":
      return {
        text: formatThreadMembershipStatus("rejected"),
        icon: XCircleIcon,
        variant: "destructive" as const,
      };
    default:
      throw new Error(
        `Unknown thread membership status: ${status satisfies never}`,
      );
  }
};
