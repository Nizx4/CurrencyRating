"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Currency, loadCurrencies } from "@/lib/data";
import RatingPill from "./rating-pill";
import Flag from "./flag";
import WatchlistToggle from "./watchlist-toggle";
import { useLiveCurrencies } from "@/lib/live";

function lerpColor(a: string, b: string, t: number) {
  const pa = a.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const pb = b.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const pc = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${pc.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const LOW = "#8B5CF6";
const MID = "#F59E0B";
const HIGH = "#22C55E";

function scoreColor(score: number) {
  const t = Math.max(0, Math.min(1, score / 100));
  if (t < 0.5) return lerpColor(LOW, MID, t / 0.5);
  return lerpColor(MID, HIGH, (t - 0.5) / 0.5);
}

export default function HeatmapGrid({ data }: { data: Currency[] }) {
  const router = useRouter();
  const [rows, setRows] = React.useState<Currency[]>(data);

  // Start polling and update when dataset changes
  useLiveCurrencies(60_000);
  React.useEffect(() => {
    const onUpdate = () => {
      loadCurrencies().then(setRows);
    };
    window.addEventListener("currencies:updated", onUpdate as EventListener);
    return () => window.removeEventListener("currencies:updated", onUpdate as EventListener);
  }, []);

  // Group by region
  const groups = rows.reduce<Record<string, Currency[]>>((acc, cur) => {
    acc[cur.region] = acc[cur.region] || [];
    acc[cur.region].push(cur);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([region, items]) => (
        <section key={region}>
          <h3 className="text-sm text-[var(--cr-muted)] mb-2">{region}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((c) => (
              <div
                key={c.code}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/currency/${c.code.toLowerCase()}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/currency/${c.code.toLowerCase()}`);
                  }
                }}
                className="cr-card p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cr-accent)]"
                style={{ backgroundColor: `${scoreColor(c.score)}20` }}
                title={`${c.code} ${c.grade} • ${c.score.toFixed(1)} (30d ${c.score_change_30d > 0 ? "+" : ""}${c.score_change_30d.toFixed(1)})`}
                aria-label={`${c.name} ${c.code}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flag code={c.code} width={24} height={16} className="h-4 w-6 rounded-sm border border-black/20" />
                    <span className="font-semibold">{c.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingPill grade={c.grade} score={c.score} />
                    <WatchlistToggle code={c.code} />
                  </div>
                </div>
                <div className="text-xs text-[var(--cr-muted)] truncate">{c.name}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
