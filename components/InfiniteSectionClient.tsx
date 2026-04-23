"use client";

import { useEffect, useState } from "react";
import { fetchSectionArticles } from "@/app/actions";
import { InfiniteSection } from "@/components/InfiniteSection";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import type { FeedArticle } from "@/lib/feed-types";
import type { SectionKey } from "@/lib/sections";

export function InfiniteSectionClient({
  sectionKey,
  label,
  country,
  initialArticles,
}: {
  sectionKey: SectionKey;
  label: string;
  country?: string;
  initialArticles: FeedArticle[];
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (initialArticles.length > 0) {
      setArticles(initialArticles);
      setIsRetrying(false);
      return;
    }

    // Server returned empty (transient API failure). Wait 2 s then re-fetch
    // via a server action — a fresh execution context that bypasses any
    // cached empty result from the current render cycle.
    setIsRetrying(true);
    const t = setTimeout(async () => {
      try {
        const fresh = await fetchSectionArticles(sectionKey, country);
        if (fresh.length > 0) setArticles(fresh);
      } finally {
        setIsRetrying(false);
      }
    }, 2000);

    return () => clearTimeout(t);
  }, [initialArticles, sectionKey, country]);

  if (isRetrying) return <SectionSkeleton label={label} />;

  return (
    <InfiniteSection
      sectionKey={sectionKey}
      label={label}
      country={country}
      initialArticles={articles}
      onSelectArticle={(article) =>
        window.dispatchEvent(new CustomEvent("meridian:open-article", { detail: article }))
      }
    />
  );
}
