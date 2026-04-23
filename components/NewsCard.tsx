"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { formatCategory } from "@/lib/categories";
import type { FeedArticle } from "@/lib/feed-types";

export type CardSize = "standard" | "wide" | "tall" | "hero";

// Pastel palette for no-image cards. All warm/neutral tones at similar
// lightness so the gradient feels cohesive across sections.
// dark: revisit when the dark palette is designed (transition to dark bg instead).
const PASTELS = [
  "#E8C4BC", // blush rose
  "#E8DCC4", // warm sand
  "#adddef", // soft 
  "#C0CADC", // soft slate blue
  "#D0C4DC", // dusty lavender
];

// Derive a stable palette index from the article ID so the same card always
// gets the same color (SSR and client agree; no hydration mismatch).
function pickPastel(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return PASTELS[h % PASTELS.length];
}

export function NewsCard({
  article,
  fallbackCategory,
  size = "standard",
  onSelect,
}: {
  article: FeedArticle;
  fallbackCategory: string;
  size?: CardSize;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const category = formatCategory(article.category[0]) || fallbackCategory;
  const showImage = !!article.image && !imgError;
  const pastel = showImage ? null : pickPastel(article.id);

  if (size === "hero") {
    return (
      <HeroVariant
        article={article}
        category={category}
        showImage={showImage}
        pastel={pastel}
        onImgError={() => setImgError(true)}
        onSelect={onSelect}
      />
    );
  }

  const layoutHorizontal = size === "wide";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex h-full w-full overflow-hidden rounded-lg border border-rule bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] ${
        layoutHorizontal ? "sm:flex-row" : "flex-col"
      }`}
    >
      {showImage && (
        <div
          className={`bg-rule sm:static sm:inset-auto sm:shrink-0 ${
            layoutHorizontal ? "sm:w-2/5 sm:self-stretch" : "sm:aspect-[16/9] sm:w-full"
          } absolute inset-0`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
          {/* Mobile-only gradient overlay with text */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-4 pt-20 sm:hidden">
            <span className="block text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/70">
              {category}
            </span>
            <h3 className="mt-1 line-clamp-3 font-serif text-[15px] font-semibold leading-[1.3] text-white">
              {article.title}
            </h3>
            <div className="mt-1.5 text-[11px] text-white/60">
              {article.author ? `${article.author} · ` : ""}
              {article.publishedLabel}
            </div>
          </div>
        </div>
      )}

      {/* Pastel gradient wash — color is stable per article ID */}
      {pastel && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
          style={{ background: `linear-gradient(to top, ${pastel}, transparent)` }}
        />
      )}

      {/* Desktop text content — also shown on mobile when there is no image.
          relative keeps this div above the absolute gradient overlay. */}
      <div className={`relative flex flex-1 flex-col gap-2 px-4 pt-3.5 pb-4 ${showImage ? "hidden sm:flex" : ""}`}>
        <span className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-accent">
          {category}
        </span>
        <h3
          className={`font-serif font-semibold leading-[1.3] text-fg ${
            size === "wide" ? "text-[17px] line-clamp-3" : "text-[15px] line-clamp-3"
          }`}
        >
          {article.title}
        </h3>
        {size === "wide" && article.description && (
          <p className="line-clamp-2 text-xs leading-[1.55] text-fg/65">
            {article.description}
          </p>
        )}
        <div className={`mt-auto pt-1.5 text-[11px] ${pastel ? "text-white/75" : "text-muted"}`}>
          {article.author ? `${article.author} · ` : ""}
          {article.publishedLabel}
        </div>
      </div>
    </button>
  );
}

function HeroVariant({
  article,
  category,
  showImage,
  pastel,
  onImgError,
  onSelect,
}: {
  article: FeedArticle;
  category: string;
  showImage: boolean;
  pastel: string | null;
  onImgError: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-rule bg-card text-left transition-shadow hover:shadow-[0_6px_28px_rgba(0,0,0,0.09)]"
    >
      {showImage && (
        <div className="absolute inset-0 bg-rule sm:static sm:inset-auto sm:aspect-[16/9] sm:w-full sm:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image!}
            alt=""
            className="h-full w-full object-cover object-top"
            onError={onImgError}
          />
          {/* Mobile-only gradient overlay — mirrors standard card behaviour */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-5 pb-5 pt-20 sm:hidden">
            <span className="block text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/70">
              {category}
            </span>
            <h2 className="mt-1 line-clamp-3 font-serif text-[18px] font-bold leading-[1.3] text-white">
              {article.title}
            </h2>
            <div className="mt-1.5 text-[11px] text-white/60">
              {article.author ? `${article.author} · ` : ""}
              {article.publishedLabel}
            </div>
          </div>
        </div>
      )}

      {/* Pastel gradient wash — color is stable per article ID */}
      {pastel && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
          style={{ background: `linear-gradient(to top, ${pastel}, transparent)` }}
        />
      )}

      {/* Hidden on mobile when image is present (text shown in overlay above instead) */}
      <div className={`relative flex flex-1 flex-col justify-center gap-2.5 px-7 py-5 ${showImage ? "hidden sm:flex" : ""}`}>
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-accent">
          <span className="inline-block h-0.5 w-5 bg-accent" />
          {category}
        </span>
        <h2 className="line-clamp-2 text-pretty font-serif text-[22px] font-bold leading-[1.25] text-fg">
          {article.title}
        </h2>
        {article.description && (
          <p className="line-clamp-2 text-pretty text-sm leading-[1.65] text-fg/65">
            {article.description}
          </p>
        )}
        <div className={`flex items-center gap-2 text-[11px] ${pastel ? "text-white/75" : "text-muted"}`}>
          {article.author && (
            <>
              <span className={`font-medium ${pastel ? "text-white/80" : "text-fg/65"}`}>
                {article.author}
              </span>
              <span>·</span>
            </>
          )}
          <span>{article.publishedLabel}</span>
        </div>
        <span
          className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
            pastel ? "text-white" : "text-accent"
          }`}
        >
          Read story
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={2}
          />
        </span>
      </div>
    </button>
  );
}
