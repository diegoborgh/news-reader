import { FeedShell, type SectionInitial } from "@/components/FeedShell";
import { getSectionPageOne } from "@/lib/feed-data";
import { DEFAULT_REGION_CODE } from "@/lib/regions-store";
import { SECTIONS } from "@/lib/sections";
import { formatCompactTopbarDate, formatTopbarDate } from "@/lib/time";

export default async function HomePage() {
  const sections: SectionInitial[] = await Promise.all(
    SECTIONS.map(async (s) => ({
      key: s.key,
      label: s.label,
      articles: await getSectionPageOne(s.key, DEFAULT_REGION_CODE),
    })),
  );

  return (
    <FeedShell
      topbarLabel={formatTopbarDate()}
      topbarMobileLabel={formatCompactTopbarDate()}
      backLabel="Today"
      country={DEFAULT_REGION_CODE}
      sections={sections}
    />
  );
}
