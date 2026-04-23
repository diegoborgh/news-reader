"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ArticleView } from "@/components/ArticleView";
import {
  BOOKMARKS_CHANGE_EVENT,
  BOOKMARKS_STORAGE_KEY,
} from "@/components/BookmarkButton";
import { NewsCard } from "@/components/NewsCard";
import { MobilePillNav } from "@/components/MobilePillNav";
import { Topbar } from "@/components/Topbar";
import type { CurrentsArticle } from "@/lib/currents";
import type { FeedArticle } from "@/lib/feed-types";
import { formatRelative } from "@/lib/time";

function readBookmarks(): CurrentsArticle[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CurrentsArticle[]) : [];
  } catch {
    return [];
  }
}

function removeBookmark(id: string): void {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const next = Array.isArray(parsed)
      ? (parsed as CurrentsArticle[]).filter((b) => b.id !== id)
      : [];
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(BOOKMARKS_CHANGE_EVENT));
  } catch {}
}

export function BookmarksView() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<CurrentsArticle[]>([]);
  const [selected, setSelected] = useState<CurrentsArticle | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(readBookmarks());
    refresh();
    window.addEventListener(BOOKMARKS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!mounted) {
    return (
      <>
        <Topbar label="Bookmarks" count={null} />
        <MobilePillNav />
        <div className="flex-1" />
      </>
    );
  }

  if (selected) {
    // When the selected article is unbookmarked from within the detail view,
    // keep it visible until the user presses Back — removal from the list
    // happens on their next return.
    return (
      <ArticleView
        article={selected}
        fallbackCategory="Bookmarks"
        backLabel="Bookmarks"
        onBack={() => setSelected(null)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Topbar label="Bookmarks" count={0} />
        <MobilePillNav />
        <div className="flex-1 overflow-y-auto px-8 pt-16 text-sm leading-[1.65] text-muted">
          No bookmarks yet. Open any story and use the Save button to add one.
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar label="Bookmarks" count={items.length} />
      <MobilePillNav />
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-8 pt-7 pb-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const labeled: FeedArticle = {
            ...item,
            publishedLabel: formatRelative(item.published),
          };
          return (
            <div key={item.id} className="group relative">
              <NewsCard
                article={labeled}
                fallbackCategory="Bookmarks"
                onSelect={() => setSelected(item)}
              />
              <button
                type="button"
                aria-label="Remove bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(item.id);
                }}
                className="absolute right-2.5 bottom-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 text-muted opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-rule hover:text-accent"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
