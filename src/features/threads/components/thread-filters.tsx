"use client";

import { SearchInput } from "@/components/search-input";
import { useThreadParams } from "../hooks/use-thread-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  THREAD_FILTER_BY_OPTIONS,
  THREAD_SORT_BY_OPTIONS,
  ThreadFilterByOptionType,
  ThreadSortByOptionType,
} from "../lib/params";
import {
  formatThreadFilterByOptions,
  formatThreadSortByOptions,
} from "../lib/formatters";

export const ThreadFilters = () => {
  const [filters, setFilters] = useThreadParams();

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        initialSearch={filters.search}
        onValueChange={(value) => setFilters({ ...filters, search: value })}
        placeholder="Search by title or description..."
      />
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            setFilters({ ...filters, sortBy: value as ThreadSortByOptionType })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {THREAD_SORT_BY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {formatThreadSortByOptions(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.filterBy}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              filterBy: value as ThreadFilterByOptionType,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            {THREAD_FILTER_BY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {formatThreadFilterByOptions(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
