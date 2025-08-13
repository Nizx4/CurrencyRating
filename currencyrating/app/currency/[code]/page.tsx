import { loadCurrencies } from "@/lib/data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Flag from "@/components/flag";
import RatingPill from "@/components/rating-pill";
import WatchlistToggle from "@/components/watchlist-toggle";
import ShareButton from "@/components/share-button";
import DriverBreakdown from "@/components/driver-breakdown";
import TimeSeriesChart from "@/components/time-series-chart";
import ComparePicker from "@/components/compare-picker";
import { formatNumber } from "@/lib/utils";

export const dynamicParams = false;

export async function generateStaticParams() {
  const data = await loadCurrencies();
  return data.map((c) => ({ code: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const data = await loadCurrencies();
  const c = data.find((x) => x.code.toLowerCase() === params.code.toLowerCase());
  if (!c) return {};
  const title = `${c.name} (${c.code}) — Rating & Score`;
  const scoreStr = typeof c.score === "number" ? c.score.toFixed(1) : "—";
  const ch = c.score_change_30d as number | null | undefined;
  const changeStr = typeof ch === "number" ? `${ch > 0 ? "+" : ""}${ch.toFixed(1)}` : "—";
  const desc = `${c.name} (${c.code}) rating ${c.grade}, score ${scoreStr}. 30d change ${changeStr}.`;
  const path = `/currency/${c.code.toLowerCase()}`;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: desc,
      url: path,
      siteName: "CurrencyRating",
      type: "website",
    },
  };
}

export default async function CurrencyProfile({ params }: { params: { code: string } }) {
  const data = await loadCurrencies();
  const c = data.find((x) => x.code.toLowerCase() === params.code.toLowerCase());
  if (!c) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <section id="profile-card" className="cr-card p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Flag code={c.code} width={36} height={24} className="h-6 w-9 rounded-sm border border-black/20" />
          <div>
            <div className="text-xl font-bold flex items-center gap-3">
              {c.name} <span className="text-sm text-[var(--cr-muted)]">{c.code}</span>
              <RatingPill grade={c.grade} score={c.score} />
            </div>
            <div className="text-sm text-[var(--cr-muted)]">Score {formatNumber(c.score, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · 30d {typeof c.score_change_30d === "number" ? `${c.score_change_30d > 0 ? "+" : ""}${c.score_change_30d.toFixed(1)}` : "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WatchlistToggle code={c.code} />
          <ShareButton targetId="profile-card" />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <DriverBreakdown drivers={c.drivers} />
        <TimeSeriesChart score={(typeof c.score === "number" ? c.score : 0)} change30={(typeof c.score_change_30d === "number" ? c.score_change_30d : 0)} />
      </div>

      <section className="cr-card p-4 grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Facts</h3>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between"><dt className="text-[var(--cr-muted)]">Regime</dt><dd>{c.regime || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--cr-muted)]">Policy rate</dt><dd>{typeof c.policy_rate === "number" ? `${formatNumber(c.policy_rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--cr-muted)]">Reserves (USD bn)</dt><dd>{formatNumber(c.reserves_usd_b as number | null | undefined)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--cr-muted)]">Current account (% GDP)</dt><dd>{typeof c.current_account_gdp_pct === "number" ? `${formatNumber(c.current_account_gdp_pct, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : "—"}</dd></div>
          </dl>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Notes & Events</h3>
          <p className="text-sm text-[var(--cr-muted)]">{c.notes || "—"}</p>
        </div>
      </section>

      <section className="flex items-center justify-between">
        <div className="font-semibold">Quick compare</div>
        <ComparePicker base={c.code} />
      </section>
    </div>
  );
}
