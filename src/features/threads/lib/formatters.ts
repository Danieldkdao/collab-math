import { GlobeIcon, LockIcon } from "lucide-react";
import { ThreadFilterByOptionType, ThreadSortByOptionType } from "./params";

export const formatThreadSortByOptions = (option: ThreadSortByOptionType) => {
  switch (option) {
    case "most_recent":
      return "Most recent";
    case "most_collaborators":
      return "Most collaborators";
    case "most_comments":
      return "Most comments";
    case "oldest":
      return "Oldest";
    default:
      throw new Error(
        `Unknown thread sort by option: ${option satisfies never}`,
      );
  }
};

export const formatThreadFilterByOptions = (
  option: ThreadFilterByOptionType,
) => {
  switch (option) {
    case "all":
      return "All";
    case "private":
      return "Private";
    case "public":
      return "Public";
    default:
      throw new Error(
        `Unknown thread filter by option: ${option satisfies never}`,
      );
  }
};

export const getThreadPublicBadgesStyles = (isPublic: boolean) => {
  if (isPublic)
    return {
      text: "Public",
      variant: "default" as const,
      icon: GlobeIcon,
    };
  return {
    text: "Private",
    variant: "outline" as const,
    icon: LockIcon,
  };
};
