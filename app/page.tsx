import { Suspense } from "react";
import { FeedShell } from "@/components/FeedShell";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { SectionStream } from "@/components/SectionStream";
import { DEFAULT_REGION_CODE } from "@/lib/regions-store";
import { SECTIONS } from "@/lib/sections";
import { formatCompactTopbarDate, formatTopbarDate } from "@/lib/time";

export default function HomePage() {
  return (
    <FeedShell
      topbarLabel={formatTopbarDate()}
      topbarMobileLabel={formatCompactTopbarDate()}
      backLabel="Today"
      country={DEFAULT_REGION_CODE}
    >
      {SECTIONS.map((s) => (
        <Suspense key={`${DEFAULT_REGION_CODE}-${s.key}`} fallback={<SectionSkeleton label={s.label} />}>
          <SectionStream sectionKey={s.key} label={s.label} country={DEFAULT_REGION_CODE} />
        </Suspense>
      ))}
    </FeedShell>
  );
}
