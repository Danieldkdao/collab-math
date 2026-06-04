import { CollaboratorSortByOptionType } from "./params";

export const formatCollaboratorSortByOptions = (
  option: CollaboratorSortByOptionType,
) => {
  switch (option) {
    case "most_collaborations":
      return "Most Collaborations";
    case "most_recent":
      return "Most Recent";
    case "oldest":
      return "Oldest";
    default:
      throw new Error(
        `Unknown collaborator option type: ${option satisfies never}`,
      );
  }
};
