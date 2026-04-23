"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function SidebarCollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={onToggle}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-black/5 hover:text-fg"
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" strokeWidth={1.8} />
      ) : (
        <PanelLeftClose className="h-4 w-4" strokeWidth={1.8} />
      )}
    </button>
  );
}
