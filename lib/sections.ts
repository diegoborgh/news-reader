import type { CurrentsCategory } from "@/lib/currents";

export type SectionKey =
  | "latest"
  | "general"
  | "technology"
  | "business"
  | "entertainment"
  | "lifestyle"
  | "health"
  | "environment"
  | "sports";

export interface Section {
  key: SectionKey;
  label: string;
  category: CurrentsCategory | null;
  /** Fetch from multiple categories and interleave results. */
  categories?: CurrentsCategory[];
  searchKeywords?: string;
  /** Case-insensitive substrings — articles whose title or description contain any of these are dropped. */
  excludeKeywords?: string[];
}

export const SECTIONS: readonly Section[] = [
  { key: "latest", label: "Latest News", category: "politics_government" },
  { key: "general", label: "General", category: "general" },
  { key: "technology", label: "Technology", category: "science_technology" },
  { key: "business", label: "Business", category: "economy_business_finance", excludeKeywords: ["Earnings Call"] },
  {
    key: "entertainment",
    label: "Entertainment",
    category: "arts_culture_entertainment",
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    category: null,
    categories: ["lifestyle_leisure", "human_interest"],
  },
  { key: "health", label: "Health", category: "health" },
  { key: "environment", label: "Environment", category: "environment" },
  { key: "sports", label: "Sports", category: "sport" },
] as const;

export function findSection(key: string): Section | undefined {
  return SECTIONS.find((s) => s.key === key);
}
