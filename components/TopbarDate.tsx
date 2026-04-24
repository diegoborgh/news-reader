"use client";

import { useEffect, useState } from "react";
import { formatTopbarDate, formatCompactTopbarDate } from "@/lib/time";

// Date computed client-side to match the user's local timezone.
// Server-side formatting (UTC) would show the wrong day for users whose
// local midnight differs from UTC (e.g., US timezones past midnight UTC).
export function TopbarDate() {
  const [full, setFull] = useState("");
  const [compact, setCompact] = useState("");

  useEffect(() => {
    const now = new Date();
    setFull(formatTopbarDate(now));
    setCompact(formatCompactTopbarDate(now));
  }, []);

  return (
    <>
      <span className="lining-nums min-[720px]:hidden" suppressHydrationWarning>{compact}</span>
      <span className="lining-nums hidden min-[720px]:inline" suppressHydrationWarning>{full}</span>
    </>
  );
}
