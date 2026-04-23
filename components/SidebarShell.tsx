"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

const DEFAULT_WIDTH = 220;
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const COLLAPSED_WIDTH = 56;

const WIDTH_KEY = "meridian_sidebar_width";
const COLLAPSED_KEY = "meridian_sidebar_collapsed";

function setCssVar(width: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
}

export function SidebarShell() {
  // Start at default to avoid hydration mismatch; hydrate from localStorage in effect.
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    try {
      const storedWidth = window.localStorage.getItem(WIDTH_KEY);
      const storedCollapsed = window.localStorage.getItem(COLLAPSED_KEY);
      const parsedWidth = storedWidth ? Number(storedWidth) : NaN;
      if (Number.isFinite(parsedWidth)) {
        const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsedWidth));
        setWidth(clamped);
      }
      if (storedCollapsed === "true") setCollapsed(true);
    } catch {
      // noop
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setCssVar(collapsed ? COLLAPSED_WIDTH : width);
  }, [width, collapsed, hydrated]);

  const persistWidth = useCallback((w: number) => {
    try {
      window.localStorage.setItem(WIDTH_KEY, String(w));
    } catch {
      // noop
    }
  }, []);

  const persistCollapsed = useCallback((c: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(c));
    } catch {
      // noop
    }
  }, []);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (collapsed) return;
      e.preventDefault();
      draggingRef.current = true;
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (!draggingRef.current) return;
        const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, ev.clientX));
        setWidth(next);
        setCssVar(next);
      };

      const onUp = () => {
        draggingRef.current = false;
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
        setWidth((w) => {
          persistWidth(w);
          return w;
        });
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    },
    [collapsed, persistWidth],
  );

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      return next;
    });
  }, [persistCollapsed]);

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  return (
    <aside
      className="relative hidden shrink-0 md:flex"
      style={{ width: effectiveWidth }}
    >
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={onHandlePointerDown}
        className={`absolute top-0 right-0 z-20 h-full w-1.5 -translate-x-1/2 touch-none select-none ${
          collapsed ? "cursor-default" : "cursor-col-resize hover:bg-accent/20"
        }`}
      />
    </aside>
  );
}
