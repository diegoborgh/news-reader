"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Cpu,
  Film,
  Heart,
  LayoutList,
  Leaf,
  Newspaper,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";
import { SidebarCollapseToggle } from "@/components/SidebarCollapseToggle";
import { SidebarDate } from "@/components/SidebarDate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SECTIONS, type SectionKey } from "@/lib/sections";

const SECTION_ICONS: Record<SectionKey, React.ReactNode> = {
  latest: <Newspaper className="h-3.5 w-3.5" strokeWidth={1.8} />,
  general: <LayoutList className="h-3.5 w-3.5" strokeWidth={1.8} />,
  technology: <Cpu className="h-3.5 w-3.5" strokeWidth={1.8} />,
  business: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />,
  entertainment: <Film className="h-3.5 w-3.5" strokeWidth={1.8} />,
  lifestyle: <Utensils className="h-3.5 w-3.5" strokeWidth={1.8} />,
  health: <Heart className="h-3.5 w-3.5" strokeWidth={1.8} />,
  environment: <Leaf className="h-3.5 w-3.5" strokeWidth={1.8} />,
  sports: <Trophy className="h-3.5 w-3.5" strokeWidth={1.8} />,
};

export function Sidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col overflow-y-auto border-r border-rule bg-sidebar pb-6">
      <div
        className={`flex items-start justify-between gap-2 border-b border-rule pt-6 pb-5 ${
          collapsed ? "px-2" : "px-6"
        }`}
      >
        {!collapsed ? (
          <div>
            <Link href="/" className="block">
              <span className="block font-serif text-[22px] font-bold leading-none tracking-tight text-fg">
                Meridian
              </span>
            </Link>
            <span className="mt-[14px] block text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
              Trusted Journalism
            </span>
          </div>
        ) : (
          <Link href="/" className="block" aria-label="Meridian home">
            <span className="block font-serif text-[22px] font-bold leading-none text-fg">
              M
            </span>
          </Link>
        )}
        <SidebarCollapseToggle collapsed={collapsed} onToggle={onToggleCollapse} />
      </div>

      <nav className="mt-2">
        {!collapsed && (
          <div className="px-6 pt-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            Sections
          </div>
        )}
        {SECTIONS.map((section) => (
          <NavLink
            key={section.key}
            href={`/#${section.key}`}
            label={section.label}
            icon={SECTION_ICONS[section.key]}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className={`my-3 h-px bg-rule ${collapsed ? "mx-2" : "mx-6"}`} />

      <NavLink
        href="/bookmarks"
        label="Bookmarks"
        icon={<Bookmark className="h-3.5 w-3.5" strokeWidth={1.8} />}
        active={pathname.startsWith("/bookmarks")}
        collapsed={collapsed}
      />

      <ThemeToggle collapsed={collapsed} />

      {!collapsed && <SidebarDate />}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  active = false,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  collapsed: boolean;
}) {
  const handleClick = href.startsWith("/#")
    ? (e: React.MouseEvent) => {
        const key = href.slice(2);
        if (document.getElementById(key)) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("meridian:scroll-to-section", { detail: key }));
        } else {
          window.dispatchEvent(new CustomEvent("meridian:close-article"));
        }
      }
    : undefined;

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        aria-label={label}
        onClick={handleClick}
        className={`mx-2 my-0.5 flex h-9 items-center justify-center rounded-md transition-colors ${
          active ? "bg-accent/10 text-accent" : "text-muted hover:bg-black/5 dark:hover:bg-white/8 hover:text-fg"
        }`}
      >
        {icon}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-2.5 border-l-[3px] px-6 py-2 text-sm select-none transition-colors ${
        active
          ? "border-accent bg-[rgb(192_57_43_/_0.07)] dark:bg-[rgb(212_67_50_/_0.12)] font-medium text-accent"
          : "border-transparent text-fg/75 hover:bg-black/5 dark:hover:bg-white/8 hover:text-fg"
      }`}
    >
      <span className={active ? "text-accent" : "text-muted"}>{icon}</span>
      {label}
    </Link>
  );
}
