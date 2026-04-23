"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

export function SearchInput({
  onSearch,
  onClear,
  active,
}: {
  onSearch: (query: string) => void;
  onClear: () => void;
  active: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  function handleClear() {
    setValue("");
    onClear();
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center" aria-label="Search stories">
      <Search
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted"
        strokeWidth={1.8}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search stories…"
        aria-label="Search"
        className={`h-8 w-[150px] sm:w-[180px] rounded-md border bg-card pl-8 pr-7 text-[12.5px] text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          active ? "border-accent" : "border-rule"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 text-muted hover:text-fg"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      )}
    </form>
  );
}
