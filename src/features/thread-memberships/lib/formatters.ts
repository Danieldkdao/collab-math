import { ThreadMembershipStatus } from "@/db/shared";

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
