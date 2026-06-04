"use client";

import { SearchInput } from "@/components/search-input";
import { useCollaboratorParams } from "../hooks/use-collaborator-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COLLABORATOR_SORT_BY_OPTIONS,
  CollaboratorSortByOptionType,
} from "../lib/params";
import { formatCollaboratorSortByOptions } from "../lib/formatters";

export const CollaboratorFilters = () => {
  const [filters, setFilters] = useCollaboratorParams();

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        initialSearch={filters.search}
        onValueChange={(search) => setFilters({ ...filters, search })}
        placeholder="Search by name or thread title..."
      />
      <Select
        value={filters.sortBy}
        onValueChange={(value) =>
          setFilters({
            ...filters,
            sortBy: value as CollaboratorSortByOptionType,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {COLLABORATOR_SORT_BY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {formatCollaboratorSortByOptions(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
