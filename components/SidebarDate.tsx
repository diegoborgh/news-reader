"use client";

import { useEffect, useState } from "react";

// Rendered client-side only. Computing the date on the server caused a
// hydration mismatch whenever the server's timezone / date rollover differed
// from the client's (e.g., server in UTC, client in PT past midnight UTC).
// suppressHydrationWarning on the placeholder silences the blank-vs-date
// diff that is intentional on first paint.
export function SidebarDate() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const weekday = now?.toLocaleDateString("en-US", { weekday: "long" }) ?? "";
  const dateLine =
    now?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? "";

  return (
    <div
      className="mt-auto px-6 text-[11px] leading-[1.6] text-muted"
      suppressHydrationWarning
    >
      <div className="font-medium text-fg/65">{weekday}</div>
      <div className="lining-nums">{dateLine}</div>
    </div>
  );
}
