"use client";

import { SearchInput } from "@/components/search-input";
import { useThreadMembershipParams } from "../hooks/use-thread-membership-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_BY_OPTIONS } from "@/lib/constants";
import { formatSortByOptions } from "@/lib/formatters";
import { SortByOptionsType } from "@/lib/types";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { ThreadMembershipStatus, threadMembershipStatuses } from "@/db/shared";
import { formatThreadMembershipStatus } from "../lib/formatters";

export const ThreadMembershipFilters = () => {
  const [filters, setFilters] = useThreadMembershipParams();

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        initialSearch={filters.search}
        onValueChange={(search) => {
          setFilters({ ...filters, search });
        }}
        placeholder="Search by thread title..."
      />
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            setFilters({ ...filters, sortBy: value as SortByOptionsType })
          }
        >
          <SelectTrigger className="py-5.25 px-4">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_BY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {formatSortByOptions(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <MultiSelect
          values={filters.membershipStatuses}
          onValuesChange={(values) =>
            setFilters({
              ...filters,
              membershipStatuses: values as ThreadMembershipStatus[],
            })
          }
        >
          <MultiSelectTrigger>
            <MultiSelectValue placeholder="Select statuses..." />
          </MultiSelectTrigger>
          <MultiSelectContent>
            {threadMembershipStatuses.map((status) => (
              <MultiSelectItem key={status} value={status}>
                {formatThreadMembershipStatus(status)}
              </MultiSelectItem>
            ))}
          </MultiSelectContent>
        </MultiSelect>
      </div>
    </div>
  );
};
