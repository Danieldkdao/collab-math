import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { COLLABORATOR_SORT_BY_OPTIONS } from "../lib/params";

export const useCollaboratorParams = () => {
  return useQueryStates(
    {
      search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
      sortBy: parseAsStringEnum([...COLLABORATOR_SORT_BY_OPTIONS])
        .withDefault("most_recent")
        .withOptions({
          clearOnDefault: true,
        }),
    },
    { shallow: false },
  );
};
