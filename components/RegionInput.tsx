"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import {
  addRegion,
  DEFAULT_REGION_CODE,
  countryCodeToName,
  loadLastRegion,
  resolveCountry,
} from "@/lib/regions-store";

export function RegionInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const last = loadLastRegion();
    setValue(countryCodeToName(last || DEFAULT_REGION_CODE));
    setHydrated(true);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const resolved = resolveCountry(value);
    if (!resolved) {
      setError("Unknown region");
      return;
    }
    setError(null);
    addRegion(resolved.code);
    setValue(resolved.name);
    if (resolved.code === DEFAULT_REGION_CODE) {
      router.push("/");
    } else {
      router.push(`/region/${resolved.code}`);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex items-center"
      aria-label="Change region"
    >
      <Globe
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted"
        strokeWidth={1.8}
      />
      <input
        type="text"
        value={hydrated ? value : ""}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Region"
        aria-label="Region"
        aria-invalid={error ? "true" : "false"}
        className={`h-8 w-[140px] rounded-md border bg-card pl-8 pr-2 text-[12.5px] text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          error ? "border-accent" : "border-rule"
        }`}
      />
      {error && (
        <span className="absolute top-full left-0 mt-1 text-[10.5px] text-accent">
          {error}
        </span>
      )}
    </form>
  );
}
