import { CommentStatusType } from "@/db/shared";

export const formatCommentStatus = (status: CommentStatusType) => {
  switch (status) {
    case "created":
      return "Created";
    case "updated":
      return "Edited";
    case "deleted":
      return "Deleted";
    default:
      throw new Error(`Unknown comment status: ${status satisfies never}`);
  }
};
