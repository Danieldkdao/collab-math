import { threadMembershipStatuses } from "@/db/shared";
import { SORT_BY_OPTIONS } from "@/lib/constants";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

export const useThreadMembershipParams = () => {
  return useQueryStates(
    {
      search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
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
    },
    { shallow: false },
  );
};
