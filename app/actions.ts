"use server";

import { revalidateTag } from "next/cache";
import {
  getByCategory,
  getLatestNews,
  searchArticles,
} from "@/lib/currents";
import { getSectionPageOne } from "@/lib/feed-data";
import { findSection, type SectionKey } from "@/lib/sections";
import { countryCodeToLanguage } from "@/lib/regions-store";
import { formatRelative } from "@/lib/time";
import type { FeedArticle } from "@/lib/feed-types";

export async function searchNews(query: string, country?: string): Promise<FeedArticle[]> {
  const keywords = query.trim();
  if (!keywords) return [];
  try {
    const articles = await searchArticles(keywords, { country, pageSize: 16 });
    const now = new Date();
    return articles.slice(0, 16).map((a) => ({
      ...a,
      publishedLabel: formatRelative(a.published, now),
    }));
  } catch (err) {
    console.error("[Currents search]:", err);
    return [];
  }
}

// Busts the cache tag used by page-1 section fetches. Called from the Topbar
// refresh button; the router.refresh() on the client side then re-invokes the
// server components and picks up the freshly fetched articles.
export async function refreshEdition() {
  revalidateTag("edition");
}

/**
 * Client-side recovery path: called by InfiniteSectionClient when a section
 * renders empty after a router.refresh(). Runs getSectionPageOne (which
 * includes its own server-side retry) in a fresh server-action context,
 * bypassing any cached empty result from the previous render.
 */
export async function fetchSectionArticles(
  sectionKey: SectionKey,
  country?: string,
): Promise<FeedArticle[]> {
  try {
    return await getSectionPageOne(sectionKey, country ?? null);
  } catch {
    return [];
  }
}

const DEFAULT_PAGE_SIZE = 24;

/**
 * Fetches the next page of articles for a given section. Used by
 * InfiniteSection when the user scrolls past the sentinel. Page 1 is
 * server-rendered (cached via `unstable_cache`); pages 2+ come through here
 * uncached because they're loaded on demand.
 */
export async function loadMoreArticles(
  sectionKey: SectionKey,
  page: number,
  country?: string,
): Promise<FeedArticle[]> {
  const section = findSection(sectionKey);
  if (!section) return [];
  if (page < 2) return [];

  const language = country ? countryCodeToLanguage(country) : "en";
  const options = { country, language, page, pageSize: DEFAULT_PAGE_SIZE };
  let articles;
  if (section.searchKeywords) {
    articles = await searchArticles(section.searchKeywords, options);
  } else if (section.category) {
    articles = await getByCategory(section.category, options);
  } else {
    articles = await getLatestNews(options);
  }

  if (section.excludeKeywords && section.excludeKeywords.length > 0) {
    const lower = section.excludeKeywords.map((k) => k.toLowerCase());
    articles = articles.filter((a) => {
      const haystack = `${a.title} ${a.description}`.toLowerCase();
      return !lower.some((kw) => haystack.includes(kw));
    });
  }

  const now = new Date();
  return articles.map((a) => ({
    ...a,
    publishedLabel: formatRelative(a.published, now),
  }));
}
