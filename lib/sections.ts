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
  | "education"
  | "sports";

export interface Section {
  key: SectionKey;
  label: string;
  category: CurrentsCategory | null;
  /** Fetch from multiple categories and interleave results. */
  categories?: CurrentsCategory[];
  searchKeywords?: string;
}

export const SECTIONS: readonly Section[] = [
  { key: "latest", label: "Latest News", category: "politics_government" },
  { key: "general", label: "General", category: "general" },
  { key: "technology", label: "Technology", category: "science_technology" },
  { key: "business", label: "Business", category: "economy_business_finance" },
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
  { key: "education", label: "Education", category: "education" },
  { key: "sports", label: "Sports", category: "sport" },
] as const;

export function findSection(key: string): Section | undefined {
  return SECTIONS.find((s) => s.key === key);
}
