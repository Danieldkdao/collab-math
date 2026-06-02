import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { MATH_PROBLEM_SORT_BY_OPTIONS } from "../lib/params";

export const useMathProblemParams = () => {
  return useQueryStates(
    {
      search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
      sortBy: parseAsStringEnum([...MATH_PROBLEM_SORT_BY_OPTIONS])
        .withDefault("most_recent")
        .withOptions({
          clearOnDefault: true,
        }),
    },
    { shallow: false },
  );
};
