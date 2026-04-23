"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { MobilePillNav } from "@/components/MobilePillNav";
import { SearchView } from "@/components/SearchView";
import { Topbar } from "@/components/Topbar";
import type { FeedArticle } from "@/lib/feed-types";

export function FeedShell({
  topbarLabel,
  topbarMobileLabel,
  backLabel,
  country: _country,
  children,
}: {
  topbarLabel: string;
  topbarMobileLabel?: string;
  backLabel: string;
  country?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<FeedArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  // Tracks whether we pushed a Next.js router entry when opening the article.
  // Browser back pops that entry (same URL) instead of navigating to the
  // previous route; popstate then closes the article via handlePopstate.
  const articleHistoryPushed = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchKey((k) => k + 1);
  }, []);

  const closeArticle = useCallback(() => {
    articleHistoryPushed.current = false;
    setSelected(null);
    clearSearch();
  }, [clearSearch]);

  const handleBack = useCallback(() => {
    const hadEntry = articleHistoryPushed.current;
    closeArticle(); // close immediately; don't wait for popstate
    if (hadEntry) router.back(); // clean up the history entry we pushed on open
  }, [closeArticle, router]);

  // Restore scroll position after the scroll container remounts on article close.
  useEffect(() => {
    if (!selected && scrollRef.current) {
      scrollRef.current.scrollTop = savedScrollY.current;
    }
  }, [selected]);

  useEffect(() => {
    const open = (e: Event) => {
      savedScrollY.current = scrollRef.current?.scrollTop ?? 0;
      setSelected((e as CustomEvent<FeedArticle>).detail);
      articleHistoryPushed.current = true;
      // Push via Next.js router so the entry is part of Next.js's navigation
      // stack. Raw history.pushState is invisible to the router and causes it
      // to jump over our entry straight to the previous route on back.
      router.push(pathname, { scroll: false });
    };
    const handlePopstate = () => {
      if (articleHistoryPushed.current) closeArticle();
    };
    window.addEventListener("meridian:open-article", open);
    window.addEventListener("meridian:close-article", closeArticle);
    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("meridian:open-article", open);
      window.removeEventListener("meridian:close-article", closeArticle);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [closeArticle, pathname, router]);

  if (selected) {
    return (
      <ArticleView
        article={selected}
        fallbackCategory={backLabel}
        backLabel={backLabel}
        onBack={handleBack}
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-7 pb-16 sm:px-8">
        {children}
      </div>
    </>
  );
}
