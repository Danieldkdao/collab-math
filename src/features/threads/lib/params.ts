import { SORT_BY_OPTIONS } from "@/lib/constants";
import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";

export const THREAD_FILTER_BY_OPTIONS = ["all", "public", "private"] as const;
export type ThreadFilterByOptionType =
  (typeof THREAD_FILTER_BY_OPTIONS)[number];

export const THREAD_SORT_BY_OPTIONS = [
  ...SORT_BY_OPTIONS,
  "most_comments",
  "most_collaborators",
] as const;
export type ThreadSortByOptionType = (typeof THREAD_SORT_BY_OPTIONS)[number];

const filterSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...THREAD_SORT_BY_OPTIONS])
    .withDefault("most_recent")
    .withOptions({
      clearOnDefault: true,
    }),
  filterBy: parseAsStringEnum([...THREAD_FILTER_BY_OPTIONS])
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
};

export const loadThreadSearchParams = createLoader(filterSearchParams);
