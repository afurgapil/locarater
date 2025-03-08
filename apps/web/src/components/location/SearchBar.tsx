"use client";

import { useState, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchParamsString: string) => {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        const params = new URLSearchParams(searchParamsString);
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.push(`/?${params.toString()}`);
      }
    }, 500),
    [onSearch, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(query, searchParams.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, searchParams.toString());
  };

  return (
    <form onSubmit={handleSubmit} className="relative h-full">
      <div className="relative h-full">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Mekan ara..."
          className="w-full h-full rounded-lg border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 pl-4 pr-10 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white sm:min-h-[38px]"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
