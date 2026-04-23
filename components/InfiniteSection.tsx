"use client";

import { MasonryGrid } from "@/components/MasonryGrid";
import type { FeedArticle } from "@/lib/feed-types";
import type { SectionKey } from "@/lib/sections";

export function InfiniteSection({
  sectionKey,
  label,
  initialArticles,
  onSelectArticle,
}: {
  sectionKey: SectionKey;
  label: string;
  country?: string;
  initialArticles: FeedArticle[];
  onSelectArticle: (article: FeedArticle) => void;
}) {
  if (initialArticles.length === 0) {
    return (
      <section id={sectionKey} className="mb-12">
        <SectionHeader label={label} />
        <p className="text-sm text-muted">No stories available right now.</p>
      </section>
    );
  }

  return (
    <section id={sectionKey} className="mb-12">
      <SectionHeader label={label} />
      <MasonryGrid
        articles={initialArticles}
        fallbackCategory={label}
        onSelect={onSelectArticle}
      />
    </section>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h2 className="font-serif text-[22px] font-bold text-fg">{label}</h2>
      <div className="h-px flex-1 bg-rule" />
    </div>
  );
}
