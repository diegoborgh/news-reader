"use client";

import { useEffect, useState } from "react";
import { searchNews } from "@/app/actions";
import { MasonryGrid } from "@/components/MasonryGrid";
import type { FeedArticle } from "@/lib/feed-types";

export function SearchView({
  query,
  onSelectArticle,
}: {
  query: string;
  onSelectArticle: (article: FeedArticle) => void;
}) {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setArticles([]);
    searchNews(query).then((results) => {
      setArticles(results);
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-7 pb-16 sm:px-8">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-serif text-[22px] font-bold text-fg">
          Results for &ldquo;{query}&rdquo;
        </h2>
        <div className="h-px flex-1 bg-rule" />
      </div>

      {loading && (
        <p className="text-sm text-muted">Searching…</p>
      )}
      {!loading && articles.length === 0 && (
        <p className="text-sm text-muted">No results found for &ldquo;{query}&rdquo;.</p>
      )}
      {!loading && articles.length > 0 && (
        <MasonryGrid
          articles={articles}
          fallbackCategory="Search"
          onSelect={onSelectArticle}
        />
      )}
    </div>
  );
}
