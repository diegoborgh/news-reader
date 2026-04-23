import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedShell } from "@/components/FeedShell";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { SectionStream } from "@/components/SectionStream";
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

  return (
    <FeedShell topbarLabel={name} backLabel={name} country={code}>
      {SECTIONS.map((s) => (
        <Suspense key={`${code}-${s.key}`} fallback={<SectionSkeleton label={s.label} />}>
          <SectionStream sectionKey={s.key} label={s.label} country={code} />
        </Suspense>
      ))}
    </FeedShell>
  );
}
