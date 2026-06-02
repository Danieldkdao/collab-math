import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import {
  THREAD_FILTER_BY_OPTIONS,
  THREAD_SORT_BY_OPTIONS,
} from "../lib/params";

export const useThreadParams = () => {
  return useQueryStates(
    {
      search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
      sortBy: parseAsStringEnum([...THREAD_SORT_BY_OPTIONS])
        .withDefault("most_recent")
        .withOptions({
          clearOnDefault: true,
        }),
      filterBy: parseAsStringEnum([...THREAD_FILTER_BY_OPTIONS])
        .withDefault("all")
        .withOptions({ clearOnDefault: true }),
    },
    {
      shallow: false,
    },
  );
};
