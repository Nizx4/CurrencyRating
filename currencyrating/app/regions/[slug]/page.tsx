import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CurrencyTable from "@/components/currency-table";
import FilterDrawer from "@/components/filter-drawer";

const SLUG_TO_REGION: Record<string, string> = {
  "g10": "G10",
  "em-asia": "EM Asia",
  "latam": "LatAm",
  "africa": "Africa",
  "emea": "EMEA",
  "europe": "Europe",
  "asia": "Asia",
  "north-america": "North America",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SLUG_TO_REGION).map((slug) => ({ slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const region = SLUG_TO_REGION[params.slug];
  if (!region) return {};
  const title = `${region} Currencies`;
  const description = `Currency grades, scores, and drivers for the ${region} region.`;
  const path = `/regions/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | CurrencyRating`,
      description,
      url: path,
      siteName: "CurrencyRating",
      type: "website",
    },
  };
}

export default function RegionPage({ params }: Props) {
  const region = SLUG_TO_REGION[params.slug];
  if (!region) return notFound();
  const title = `${region} Currencies`;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <Suspense fallback={null}>
          <FilterDrawer />
        </Suspense>
      </div>
      <CurrencyTable title={title} regions={[region]} />
    </div>
  );
}
