/**
 * Region = country. Stored as ISO-2 codes.
 *
 * The Topbar region input accepts free-text ("United Kingdom", "UK", "gb")
 * and normalizes to an ISO-2 code via `resolveCountry`. The sidebar shows
 * whichever countries the user has added.
 */

export const DEFAULT_REGION_CODE = "US";
export const REGIONS_KEY = "meridian_regions";
export const LAST_REGION_KEY = "meridian_last_region";

interface CountryEntry {
  code: string; // ISO-2, uppercase
  name: string; // display name
  /** ISO 639-1 language code sent to the Currents API. Omit = "en". */
  language?: string;
  aliases?: readonly string[]; // extra strings that resolve to this code
}

const COUNTRIES: readonly CountryEntry[] = [
  { code: "US", name: "United States", aliases: ["usa", "america", "u.s.", "u.s.a"] },
  { code: "GB", name: "United Kingdom", aliases: ["uk", "britain", "england", "great britain"] },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "DE", name: "Germany",      language: "de" },
  { code: "FR", name: "France",       language: "fr" },
  { code: "ES", name: "Spain",        language: "es" },
  { code: "IT", name: "Italy",        language: "it" },
  { code: "NL", name: "Netherlands",  language: "nl" },
  { code: "BE", name: "Belgium",      language: "nl" },
  { code: "SE", name: "Sweden",       language: "sv" },
  { code: "NO", name: "Norway",       language: "no" },
  { code: "DK", name: "Denmark",      language: "da" },
  { code: "FI", name: "Finland",      language: "fi" },
  { code: "PT", name: "Portugal",     language: "pt" },
  { code: "CH", name: "Switzerland",  language: "de" },
  { code: "AT", name: "Austria",      language: "de" },
  { code: "PL", name: "Poland",       language: "pl" },
  { code: "JP", name: "Japan",        language: "ja" },
  { code: "KR", name: "South Korea",  language: "ko", aliases: ["korea"] },
  { code: "CN", name: "China",        language: "zh" },
  { code: "HK", name: "Hong Kong",    language: "zh" },
  { code: "MX", name: "Mexico",       language: "es" },
  { code: "BR", name: "Brazil",       language: "pt" },
  { code: "AR", name: "Argentina",    language: "es" },
];

export interface ResolvedCountry {
  code: string;
  name: string;
}

/**
 * Best-effort normalization: accepts "US", "usa", "United States", etc.
 * Returns null if no match — callers should surface an inline error.
 */
export function resolveCountry(input: string): ResolvedCountry | null {
  const q = input.trim().toLowerCase();
  if (!q) return null;
  for (const c of COUNTRIES) {
    if (
      c.code.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.aliases?.some((a) => a.toLowerCase() === q)
    ) {
      return { code: c.code, name: c.name };
    }
  }
  return null;
}

export function countryCodeToName(code: string): string {
  const upper = code.toUpperCase();
  const match = COUNTRIES.find((c) => c.code === upper);
  return match?.name ?? upper;
}

export function countryCodeToLanguage(code: string): string {
  const upper = code.toUpperCase();
  const match = COUNTRIES.find((c) => c.code === upper);
  return match?.language ?? "en";
}

export function loadRegions(): string[] {
  if (typeof window === "undefined") return [DEFAULT_REGION_CODE];
  try {
    const raw = window.localStorage.getItem(REGIONS_KEY);
    if (!raw) return [DEFAULT_REGION_CODE];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((v) => typeof v !== "string")) {
      return [DEFAULT_REGION_CODE];
    }
    return parsed.length > 0 ? parsed : [DEFAULT_REGION_CODE];
  } catch {
    return [DEFAULT_REGION_CODE];
  }
}

export function saveRegions(codes: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGIONS_KEY, JSON.stringify(codes));
    window.dispatchEvent(new CustomEvent("meridian:regions"));
  } catch {
    // localStorage quota exceeded or unavailable — fail quietly.
  }
}

export function addRegion(code: string): string[] {
  const existing = loadRegions();
  const upper = code.toUpperCase();
  if (existing.includes(upper)) {
    saveLastRegion(upper);
    return existing;
  }
  const next = [...existing, upper];
  saveRegions(next);
  saveLastRegion(upper);
  return next;
}

export function removeRegion(code: string): string[] {
  const existing = loadRegions();
  const upper = code.toUpperCase();
  const next = existing.filter((c) => c !== upper);
  const final = next.length > 0 ? next : [DEFAULT_REGION_CODE];
  saveRegions(final);
  return final;
}

export function loadLastRegion(): string {
  if (typeof window === "undefined") return DEFAULT_REGION_CODE;
  try {
    return window.localStorage.getItem(LAST_REGION_KEY) || DEFAULT_REGION_CODE;
  } catch {
    return DEFAULT_REGION_CODE;
  }
}

export function saveLastRegion(code: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_REGION_KEY, code.toUpperCase());
  } catch {
    // ignore
  }
}
