import type { CurrentsCategory } from "@/lib/currents";

const LABELS: Record<CurrentsCategory, string> = {
  general: "General",
  society: "Society",
  science_technology: "Science & Tech",
  politics_government: "Politics",
  economy_business_finance: "Business",
  arts_culture_entertainment: "Culture",
  lifestyle_leisure: "Lifestyle",
  human_interest: "Human Interest",
  sport: "Sport",
  crime_law_justice: "Justice",
  education: "Education",
  environment: "Environment",
  labour: "Labour",
  health: "Health",
  automotive: "Automotive",
  real_estate: "Real Estate",
  food: "Food",
};

export function formatCategory(slug: string | undefined): string {
  if (!slug) return "";
  if (slug in LABELS) return LABELS[slug as CurrentsCategory];
  // Fallback for unexpected slugs — underscore → space, title-case the first word.
  return slug.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
