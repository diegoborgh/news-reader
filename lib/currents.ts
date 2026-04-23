/**
 * Typed client for the Currents API (V2).
 *
 * All calls to the Currents API must go through this module. Components
 * should never call `fetch` against Currents directly — this is the one
 * place where the API key, caching, and error shaping live.
 *
 * Docs: https://currentsapi.services/en/docs/
 */

const BASE_URL = "https://api.currentsapi.services/v2";

// Seconds. Real rotation happens via the `edition` cache-key in page-1 fetches;
// these time-based windows are just a safety net against burning the 1,000 req/day quota.
const REVALIDATE = {
  latest: 60 * 30,
  search: 60 * 5,
} as const;

export type CurrentsCategory =
  | "general"
  | "society"
  | "science_technology"
  | "politics_government"
  | "economy_business_finance"
  | "arts_culture_entertainment"
  | "lifestyle_leisure"
  | "human_interest"
  | "sport"
  | "crime_law_justice"
  | "education"
  | "environment"
  | "labour"
  | "health"
  | "automotive"
  | "real_estate"
  | "food";

export interface CurrentsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  /** `null` when the source has no image — the API returns "None" as a string. */
  image: string | null;
  language: string;
  category: string[];
  published: string;
}

interface RawArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  published: string;
}

type CurrentsResponse =
  | { status: "ok"; news: RawArticle[] }
  // The API uses either `msg` or `message` depending on the error path.
  | { status: "error"; msg?: string; message?: string };

export class CurrentsAPIError extends Error {
  readonly httpStatus?: number;

  constructor(message: string, httpStatus?: number) {
    super(message);
    this.name = "CurrentsAPIError";
    this.httpStatus = httpStatus;
  }
}

function getApiKey(): string {
  const key = process.env.CURRENTS_API_KEY;
  if (!key) {
    throw new CurrentsAPIError(
      "CURRENTS_API_KEY is not set. Copy .env.local.example to .env.local and fill it in.",
    );
  }
  return key;
}

function normalize(raw: RawArticle): CurrentsArticle {
  const image = raw.image && raw.image !== "None" ? raw.image : null;
  return { ...raw, image };
}

async function fetchFromCurrents(
  path: "/latest-news" | "/search",
  params: Record<string, string>,
  revalidate: number,
  tags: string[] = [],
): Promise<CurrentsArticle[]> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: getApiKey() },
      next: { revalidate, tags },
    });
  } catch (cause) {
    throw new CurrentsAPIError(
      `Network error calling Currents: ${(cause as Error).message}`,
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new CurrentsAPIError(
        "Currents API: invalid or missing API key. Check CURRENTS_API_KEY in .env.local.",
        401,
      );
    }
    if (res.status === 429) {
      throw new CurrentsAPIError(
        "Currents API: daily request limit reached (1,000 req/day on free tier).",
        429,
      );
    }
    if (res.status === 500) {
      // The Currents API returns 500 for country+category combinations that have
      // no articles, rather than an empty array. Treat it as zero results.
      return [];
    }
    throw new CurrentsAPIError(
      `Currents API request failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const json = (await res.json()) as CurrentsResponse;

  if (json.status !== "ok") {
    const detail = json.msg ?? json.message ?? "unknown";
    throw new CurrentsAPIError(`Currents API returned error: ${detail}`);
  }

  return json.news.map(normalize);
}

export interface PagedOptions {
  /** ISO-2 country code (e.g. "US", "GB"). Omit for worldwide news. */
  country?: string;
  /** ISO 639-1 language code. Defaults to "en". */
  language?: string;
  /** 1-indexed page number. Defaults to 1. */
  page?: number;
  /** Page size. Defaults to 30. */
  pageSize?: number;
}

function pagedParams({ country, language, page, pageSize }: PagedOptions): Record<string, string> {
  const params: Record<string, string> = { language: language ?? "en" };
  if (country) params.country = country.toUpperCase();
  if (page && page > 1) params.page_number = String(page);
  if (pageSize && pageSize > 0) params.page_size = String(pageSize);
  return params;
}

/** Latest English-language news, optionally scoped to a country. */
export async function getLatestNews(
  options: PagedOptions = {},
  tags: string[] = [],
): Promise<CurrentsArticle[]> {
  return fetchFromCurrents("/latest-news", pagedParams(options), REVALIDATE.latest, tags);
}

/** Latest English-language news for a specific category, optionally scoped to a country. */
export async function getByCategory(
  category: CurrentsCategory,
  options: PagedOptions = {},
  tags: string[] = [],
): Promise<CurrentsArticle[]> {
  return fetchFromCurrents(
    "/latest-news",
    { ...pagedParams(options), category },
    REVALIDATE.latest,
    tags,
  );
}

/**
 * Full-text keyword search across recent articles.
 */
export async function searchArticles(
  query: string,
  options: PagedOptions = {},
  tags: string[] = [],
): Promise<CurrentsArticle[]> {
  const keywords = query.trim();
  if (!keywords) return [];
  return fetchFromCurrents("/search", { ...pagedParams(options), keywords }, REVALIDATE.search, tags);
}
