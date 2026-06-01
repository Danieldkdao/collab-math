import { SortByOptionsType } from "./types";

export const formatSortByOptions = (option: SortByOptionsType) => {
  switch (option) {
    case "most_recent":
      return "Most Recent";
    case "oldest":
      return "Oldest";
    default:
      throw new Error(`Unknown sort by option: ${option satisfies never}`);
  }
};
