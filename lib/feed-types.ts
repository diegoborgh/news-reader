import type { CurrentsArticle } from "@/lib/currents";

/**
 * Feed article with its relative-time label baked in. We precompute the label
 * on the server so card components don't call `new Date()` during render,
 * which would produce SSR/CSR drift across minute boundaries.
 */
export type FeedArticle = CurrentsArticle & { publishedLabel: string };
