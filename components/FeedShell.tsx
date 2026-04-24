"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { MobilePillNav } from "@/components/MobilePillNav";
import { SearchView } from "@/components/SearchView";
import { Topbar } from "@/components/Topbar";
import type { FeedArticle } from "@/lib/feed-types";

function animateScroll(container: HTMLElement, to: number, duration: number) {
  const from = container.scrollTop;
  const delta = to - from;
  const t0 = performance.now();
  function step(now: number) {
    const elapsed = Math.min(now - t0, duration);
    const t = elapsed / duration;
    // cubic ease-in-out: stronger deceleration into the target
    const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
    container.scrollTop = from + delta * eased;
    if (elapsed < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function FeedShell({
  topbarLabel,
  topbarMobileLabel,
  backLabel,
  country,
  children,
}: {
  topbarLabel: React.ReactNode;
  topbarMobileLabel?: React.ReactNode;
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

  useEffect(() => {
    const handleScrollTo = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      const el = document.getElementById(key);
      const container = scrollRef.current;
      if (!el || !container) return;
      const to = container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const distance = Math.abs(to - container.scrollTop);
      const duration = Math.min(Math.max(distance * 0.2, 500), 1000);
      animateScroll(container, to, duration);
    };
    window.addEventListener("meridian:scroll-to-section", handleScrollTo);
    return () => window.removeEventListener("meridian:scroll-to-section", handleScrollTo);
  }, []);

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
      // Hash suffix guarantees a new history entry even when the pathname
      // hasn't changed, so router.back() in handleBack always peels off
      // exactly this entry rather than overshooting to the previous route.
      router.push(`${pathname}#_article`, { scroll: false });
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
          country={country}
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
        <div className="mx-auto w-full max-w-[1316px]">
          {children}
        </div>
      </div>
    </>
  );
}
