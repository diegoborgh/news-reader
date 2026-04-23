import type { Metadata } from "next";
import { FeedShell, type SectionInitial } from "@/components/FeedShell";
import { getSectionPageOne } from "@/lib/feed-data";
import { countryCodeToName } from "@/lib/regions-store";
import { SECTIONS } from "@/lib/sections";

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const name = countryCodeToName(country);
  return { title: `${name} · Meridian` };
}

export default async function RegionPage({ params }: Props) {
  const { country } = await params;
  const code = country.toUpperCase();
  const name = countryCodeToName(code);

  const sections: SectionInitial[] = await Promise.all(
    SECTIONS.map(async (s) => ({
      key: s.key,
      label: s.label,
      articles: await getSectionPageOne(s.key, code),
    })),
  );

  return (
    <FeedShell
      topbarLabel={name}
      backLabel={name}
      country={code}
      sections={sections}
    />
  );
}
