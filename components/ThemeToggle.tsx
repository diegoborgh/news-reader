"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("meridian_theme", next ? "dark" : "light");
    } catch {}
  }

  const icon = dark
    ? <Sun className="h-3.5 w-3.5" strokeWidth={1.8} />
    : <Moon className="h-3.5 w-3.5" strokeWidth={1.8} />;

  if (collapsed) {
    return (
      <button
        type="button"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggle}
        className="mx-2 my-0.5 flex h-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/8 hover:text-fg"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center gap-2.5 border-l-[3px] border-transparent px-6 py-2 text-sm select-none transition-colors hover:bg-black/5 dark:hover:bg-white/8 hover:text-fg text-fg/75"
    >
      <span className="text-muted">{icon}</span>
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
