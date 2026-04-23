import { getSectionPageOne } from "@/lib/feed-data";
import { InfiniteSectionClient } from "@/components/InfiniteSectionClient";
import type { SectionKey } from "@/lib/sections";

export async function SectionStream({
  sectionKey,
  label,
  country,
}: {
  sectionKey: SectionKey;
  label: string;
  country?: string;
}) {
  const articles = await getSectionPageOne(sectionKey, country ?? null);
  return (
    <InfiniteSectionClient
      sectionKey={sectionKey}
      label={label}
      country={country}
      initialArticles={articles}
    />
  );
}
