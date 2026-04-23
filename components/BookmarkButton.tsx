"use client";

import { Bookmark } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CurrentsArticle } from "@/lib/currents";

const STORAGE_KEY = "meridian_bookmarks";
const MAX_BOOKMARKS = 200;
const CHANGE_EVENT = "meridian:bookmarks";

function readBookmarks(): CurrentsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CurrentsArticle[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks: CurrentsArticle[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bookmarks.slice(0, MAX_BOOKMARKS)),
    );
  } catch {
    // Quota exceeded or storage disabled — silently no-op.
  }
}

export function BookmarkButton({ article }: { article: CurrentsArticle }) {
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsSaved(readBookmarks().some((b) => b.id === article.id));
  }, [article.id]);

  const toggle = useCallback(() => {
    const current = readBookmarks();
    const exists = current.some((b) => b.id === article.id);
    const next = exists
      ? current.filter((b) => b.id !== article.id)
      : [article, ...current];
    writeBookmarks(next);
    setIsSaved(!exists);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [article]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove bookmark" : "Save to bookmarks"}
      className="inline-flex h-9 items-center gap-1.5 rounded-[20px] border border-rule bg-sidebar px-3 text-xs text-muted transition-colors hover:text-fg"
    >
      <Bookmark
        className="h-3.5 w-3.5"
        strokeWidth={2}
        fill={isSaved ? "currentColor" : "transparent"}
      />
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}

export { STORAGE_KEY as BOOKMARKS_STORAGE_KEY, CHANGE_EVENT as BOOKMARKS_CHANGE_EVENT };
