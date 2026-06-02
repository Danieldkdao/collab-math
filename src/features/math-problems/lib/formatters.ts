import { MathProblemSortByOptionType } from "./params";

export const formatMathProblemSortByOptions = (
  option: MathProblemSortByOptionType,
) => {
  switch (option) {
    case "most_recent":
      return "Most Recent";
    case "most_used":
      return "Most Used";
    case "oldest":
      return "Oldest";
    default:
      throw new Error(
        `Unknown math problem sort option: ${option satisfies never}`,
      );
  }
};
