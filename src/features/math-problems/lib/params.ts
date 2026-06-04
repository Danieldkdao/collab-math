import { SORT_BY_OPTIONS } from "@/lib/constants";
import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";

export const MATH_PROBLEM_SORT_BY_OPTIONS = [
  ...SORT_BY_OPTIONS,
  "most_used",
] as const;
export type MathProblemSortByOptionType =
  (typeof MATH_PROBLEM_SORT_BY_OPTIONS)[number];

const filterSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...MATH_PROBLEM_SORT_BY_OPTIONS])
    .withDefault("most_recent")
    .withOptions({
      clearOnDefault: true,
    }),
};

export const loadMathProblemSearchParams = createLoader(filterSearchParams);
