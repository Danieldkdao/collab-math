import { threadMembershipStatuses } from "@/db/schema";
import { SORT_BY_OPTIONS } from "@/lib/constants";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const filterSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...SORT_BY_OPTIONS])
    .withDefault("most_recent")
    .withOptions({
      clearOnDefault: true,
    }),
  membershipStatuses: parseAsArrayOf(
    parseAsStringEnum([...threadMembershipStatuses]),
  )
    .withDefault(["pending", "accepted"])
    .withOptions({ clearOnDefault: true }),
};

export const loadThreadMembershipSearchParams =
  createLoader(filterSearchParams);
