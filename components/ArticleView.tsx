"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { formatCategory } from "@/lib/categories";
import type { CurrentsArticle } from "@/lib/currents";
import { formatRelative } from "@/lib/time";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function ArticleView({
  article,
  fallbackCategory,
  backLabel,
  onBack,
}: {
  article: CurrentsArticle;
  fallbackCategory: string;
  backLabel: string;
  onBack: () => void;
}) {
  const category = formatCategory(article.category[0]) || fallbackCategory;
  const domain = getDomain(article.url);
  const paragraphs = article.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-bg px-8 py-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to {backLabel}
        </button>
        <BookmarkButton article={article} />
      </div>

      <article className="mx-auto max-w-[680px] px-8 pt-12 pb-20">
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
          <span className="inline-block h-0.5 w-6 bg-accent" />
          {category}
        </span>
        <h1 className="mt-4 text-pretty font-serif text-[38px] font-bold leading-[1.15] text-fg">
          {article.title}
        </h1>
        <div className="mt-5 flex items-center gap-3 border-b border-rule pb-5 text-xs text-muted">
          {article.author && (
            <>
              <span className="font-medium text-fg/80">{article.author}</span>
              <span>·</span>
            </>
          )}
          <span>{formatRelative(article.published)}</span>
        </div>
        {article.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt=""
            className="mt-7 aspect-[16/9] w-full rounded-md object-cover"
          />
        )}
        <div className="mt-7 space-y-5 text-base leading-[1.8] text-fg/90">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-pretty [&::first-letter]:float-left [&::first-letter]:mt-[0.1em] [&::first-letter]:mr-2 [&::first-letter]:font-serif [&::first-letter]:text-[4em] [&::first-letter]:font-bold [&::first-letter]:leading-[0.75] [&::first-letter]:text-accent"
                    : "text-pretty"
                }
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-muted">No preview available.</p>
          )}
        </div>
        <div className="mt-10 border-t border-rule pt-7">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[20px] bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue reading at {domain}
            <ExternalLink className="h-4 w-4" strokeWidth={2} />
          </a>
        </div>
      </article>
    </div>
  );
}
