"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useDebouncedCallback } from "@tanstack/react-pacer";

export const SearchInput = ({
  initialSearch,
  onValueChange,
  placeholder,
}: {
  initialSearch: string;
  onValueChange: (search: string) => void;
  placeholder?: string;
}) => {
  const [search, setSearch] = useState(initialSearch);
  const debouncedOnValueChange = useDebouncedCallback(onValueChange, {
    wait: 300,
  });

  return (
    <div className="flex items-center gap-2 bg-transparent dark:bg-input/30 rounded-lg shadow-sm dark:shadow-none p-2 px-4 border border-border">
      <SearchIcon />
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          debouncedOnValueChange(e.target.value);
        }}
        placeholder={placeholder}
        className="bg-transparent text-xl md:text-xl dark:bg-transparent outline-0 border-0 ring-0 focus-visible:outline-0 focus-visible:ring-0 shadow-none"
      />
    </div>
  );
};
