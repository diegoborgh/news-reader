"use client";

import { useCallback, useEffect, useState } from "react";
import { ArticleView } from "@/components/ArticleView";
import { InfiniteSection } from "@/components/InfiniteSection";
import { MobilePillNav } from "@/components/MobilePillNav";
import { SearchView } from "@/components/SearchView";
import { Topbar } from "@/components/Topbar";
import type { FeedArticle } from "@/lib/feed-types";
import { SECTIONS } from "@/lib/sections";

export interface SectionInitial {
  key: (typeof SECTIONS)[number]["key"];
  label: string;
  articles: FeedArticle[];
}

export function FeedShell({
  topbarLabel,
  topbarMobileLabel,
  backLabel,
  country,
  sections,
}: {
  topbarLabel: string;
  topbarMobileLabel?: string;
  backLabel: string;
  country?: string;
  sections: SectionInitial[];
}) {
  const [selected, setSelected] = useState<FeedArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const close = () => {
      setSelected(null);
      clearSearch();
    };
    window.addEventListener("meridian:close-article", close);
    return () => window.removeEventListener("meridian:close-article", close);
  }, [clearSearch]);

  if (selected) {
    return (
      <ArticleView
        article={selected}
        fallbackCategory={backLabel}
        backLabel={backLabel}
        onBack={() => setSelected(null)}
      />
    );
  }

  const topbar = (
    <Topbar
      label={topbarLabel}
      mobileLabel={topbarMobileLabel}
      count={null}
      onSearch={setSearchQuery}
      onSearchClear={clearSearch}
      searchActive={!!searchQuery}
    />
  );

  if (searchQuery) {
    return (
      <>
        {topbar}
        <MobilePillNav />
        <SearchView
          key={searchQuery}
          query={searchQuery}
          onSelectArticle={setSelected}
        />
      </>
    );
  }

  return (
    <>
      {/* key resets SearchInput's local value when search is cleared externally */}
      <Topbar
        label={topbarLabel}
        mobileLabel={topbarMobileLabel}
        count={null}
        onSearch={setSearchQuery}
        onSearchClear={clearSearch}
        searchActive={false}
        key={searchKey}
      />
      <MobilePillNav />
      <div className="flex-1 overflow-y-auto px-6 pt-7 pb-16 sm:px-8">
        {sections.map((s) => (
          <InfiniteSection
            key={`${country ?? "home"}-${s.key}`}
            sectionKey={s.key}
            label={s.label}
            country={country}
            initialArticles={s.articles}
            onSelectArticle={setSelected}
          />
        ))}
      </div>
    </>
  );
}
