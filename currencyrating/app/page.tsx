import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import HeatmapGrid from "@/components/heatmap-grid";
import CurrencyCard from "@/components/currency-card";
import UpdateBadge from "@/components/update-badge";
import { loadCurrencies, topMovers, mostStable } from "@/lib/data";

export const metadata: Metadata = {
  title: "Home",
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — Currency ratings and scores`,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    type: "website",
  },
};

export default async function Home() {
  const data = await loadCurrencies();
  const movers = topMovers("30d", 5);
  const stable = mostStable("90d", 5);
  const last = data.map((d) => d.last_updated).sort().at(-1) ?? "";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">A clear rating for every currency.</h1>
            <p className="text-[var(--cr-muted)]">Letter grades and a 0–100 score you can actually explain.</p>
          </div>
          <UpdateBadge lastUpdated={last} />
        </div>
      </section>
      <section className="mb-10">
        <HeatmapGrid data={data} />
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Top movers (30 days)</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {movers.map((c) => (
            <CurrencyCard key={c.code} currency={c} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Most stable (90 days)</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stable.map((c) => (
            <CurrencyCard key={c.code} currency={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
