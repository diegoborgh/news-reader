"use client";

import { NewsCard, type CardSize } from "@/components/NewsCard";
import type { FeedArticle } from "@/lib/feed-types";

// Index 0 is always the hero (2×2). Index 3 is a wide card that fills the
// second hero row. Everything else is standard — this produces a clean
// 3-row layout for 8 articles with no orphaned cards.
function sizeForIndex(index: number): CardSize {
  if (index === 0) return "hero";
  if (index === 3) return "wide";
  return "standard";
}

export function MasonryGrid({
  articles,
  fallbackCategory,
  onSelect,
}: {
  articles: FeedArticle[];
  fallbackCategory: string;
  onSelect: (article: FeedArticle) => void;
}) {
  return (
    <div className="grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {articles.map((article, index) => {
        const size = sizeForIndex(index);
        const span = spanClass(size);
        return (
          <div key={article.id} className={span}>
            <NewsCard
              article={article}
              fallbackCategory={fallbackCategory}
              size={size}
              onSelect={() => onSelect(article)}
            />
          </div>
        );
      })}
    </div>
  );
}

function spanClass(size: CardSize): string {
  switch (size) {
    case "hero":
      // Large hero: 2 columns × 2 rows on md+, full width on mobile.
      return "sm:col-span-2 sm:row-span-2";
    case "wide":
      return "sm:col-span-2";
    case "tall":
      return "row-span-2";
    case "standard":
    default:
      return "";
  }
}
