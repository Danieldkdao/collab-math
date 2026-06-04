import { SORT_BY_OPTIONS } from "@/lib/constants";
import { parseAsString, parseAsStringEnum, createLoader } from "nuqs/server";

export const COLLABORATOR_SORT_BY_OPTIONS = [
  ...SORT_BY_OPTIONS,
  "most_collaborations",
] as const;
export type CollaboratorSortByOptionType =
  (typeof COLLABORATOR_SORT_BY_OPTIONS)[number];

const filterSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...COLLABORATOR_SORT_BY_OPTIONS])
    .withDefault("most_recent")
    .withOptions({
      clearOnDefault: true,
    }),
};

export const loadCollaboratorSearchParams = createLoader(filterSearchParams);
