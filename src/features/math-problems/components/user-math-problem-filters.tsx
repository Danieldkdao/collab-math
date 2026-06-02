"use client";

import { SearchInput } from "@/components/search-input";
import { useMathProblemParams } from "../hooks/use-math-problem-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MATH_PROBLEM_SORT_BY_OPTIONS,
  MathProblemSortByOptionType,
} from "../lib/params";
import { formatMathProblemSortByOptions } from "../lib/formatters";

export const UserMathProblemFilters = () => {
  const [filters, setFilters] = useMathProblemParams();

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        initialSearch={filters.search}
        onValueChange={(search) => setFilters({ ...filters, search })}
        placeholder="Search by title or content..."
      />
      <Select
        value={filters.sortBy}
        onValueChange={(value) =>
          setFilters({
            ...filters,
            sortBy: value as MathProblemSortByOptionType,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {MATH_PROBLEM_SORT_BY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {formatMathProblemSortByOptions(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
