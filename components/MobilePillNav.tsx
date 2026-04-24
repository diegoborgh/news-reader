"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SECTIONS } from "@/lib/sections";

export function MobilePillNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto border-b border-rule bg-sidebar px-4 py-2 md:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {SECTIONS.map((section) => (
        <Link
          key={section.key}
          href={`/#${section.key}`}
          onClick={(e) => {
              const key = section.key;
              if (document.getElementById(key)) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("meridian:scroll-to-section", { detail: key }));
              } else {
                window.dispatchEvent(new CustomEvent("meridian:close-article"));
              }
            }}
          className="shrink-0 rounded-full border border-rule bg-card px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-fg transition-colors hover:bg-black/5 dark:hover:bg-white/8"
        >
          {section.label}
        </Link>
      ))}
      <div className="flex-1" />
      <ThemeToggle pill />
      <Link
        href="/bookmarks"
        aria-label="Bookmarks"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          pathname.startsWith("/bookmarks")
            ? "border-accent bg-accent text-white"
            : "border-rule bg-card text-muted hover:bg-black/5 dark:hover:bg-white/8"
        }`}
      >
        <Bookmark className="h-3.5 w-3.5" strokeWidth={1.8} />
      </Link>
    </nav>
  );
}
