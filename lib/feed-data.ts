import {
  getByCategory,
  getLatestNews,
  searchArticles,
  type CurrentsArticle,
} from "@/lib/currents";
import { findSection, type SectionKey } from "@/lib/sections";
import { countryCodeToLanguage } from "@/lib/regions-store";
import { formatRelative } from "@/lib/time";
import type { FeedArticle } from "@/lib/feed-types";

export const PAGE_ONE_SIZE = 8;

// Tag shared with revalidateTag("edition") in the refresh action.
const EDITION_TAGS = ["edition"];

async function tryFetch(
  sectionKey: SectionKey,
  country: string | null,
): Promise<CurrentsArticle[]> {
  const section = findSection(sectionKey);
  if (!section) return [];
  const language = country ? countryCodeToLanguage(country) : "en";
  const options = { country: country ?? undefined, language, page: 1, pageSize: PAGE_ONE_SIZE };

  if (section.searchKeywords) {
    return searchArticles(section.searchKeywords, options, EDITION_TAGS);
  }

  if (section.categories && section.categories.length > 0) {
    const perCat = Math.ceil(PAGE_ONE_SIZE / section.categories.length);
    const results = await Promise.all(
      section.categories.map((cat) =>
        getByCategory(cat, { ...options, pageSize: perCat }, EDITION_TAGS).catch(
          (): CurrentsArticle[] => [],
        ),
      ),
    );
    // Interleave: take one from each category in turn so both are represented.
    const merged: CurrentsArticle[] = [];
    const maxLen = Math.max(...results.map((r) => r.length));
    for (let i = 0; i < maxLen; i++) {
      for (const result of results) {
        if (result[i]) merged.push(result[i]);
      }
    }
    return merged;
  }

  return section.category
    ? getByCategory(section.category, options, EDITION_TAGS)
    : getLatestNews(options, EDITION_TAGS);
}

async function fetchSectionPageOne(
  sectionKey: SectionKey,
  country: string | null,
): Promise<CurrentsArticle[]> {
  const articles = await tryFetch(sectionKey, country);
  if (articles.length > 0) return articles;
  // Currents API sometimes returns 500 (treated as []) transiently right after
  // a cache bust when 7 parallel requests hit at once. Retry once after 800ms.
  await new Promise<void>((r) => setTimeout(r, 800));
  return tryFetch(sectionKey, country);
}

/**
 * Returns the first page of articles for a section, with relative-time labels
 * baked in. Returns `[]` on any API failure — callers render a quiet empty
 * state, not a stack trace.
 */
export async function getSectionPageOne(
  sectionKey: SectionKey,
  country: string | null,
): Promise<FeedArticle[]> {
  let articles: CurrentsArticle[];
  try {
    articles = await fetchSectionPageOne(sectionKey, country);
  } catch (err) {
    console.error(`[Currents] ${sectionKey}:`, err);
    return [];
  }

  const now = new Date();
  const sliced = articles.slice(0, PAGE_ONE_SIZE);

  // Hero (index 0) must have an image — swap in the first image-bearing article.
  if (sliced.length > 0 && !sliced[0].image) {
    const withImageIdx = sliced.findIndex((a) => a.image);
    if (withImageIdx > 0) {
      [sliced[0], sliced[withImageIdx]] = [sliced[withImageIdx], sliced[0]];
    }
  }

  const seenImages = new Set<string>();
  return sliced.map((a) => {
    let image = a.image;
    if (image) {
      if (seenImages.has(image)) {
        image = null;
      } else {
        seenImages.add(image);
      }
    }
    return { ...a, image, publishedLabel: formatRelative(a.published, now) };
  });
}
