"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { refreshEdition } from "@/app/actions";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Refresh"
      aria-label="Refresh stories"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await refreshEdition();
          await new Promise<void>((r) => setTimeout(r, 800));
          router.refresh();
        });
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-rule hover:text-fg disabled:opacity-50"
    >
      <RefreshCw
        className={`h-[14px] w-[14px] ${isPending ? "animate-spin" : ""}`}
        strokeWidth={1.8}
      />
    </button>
  );
}
