"use client";

import * as React from "react";
import { Currency, loadCurrencies } from "@/lib/data";
import RatingPill from "./rating-pill";
import Flag from "./flag";
import WatchlistToggle from "./watchlist-toggle";
import { useLiveCurrencies } from "@/lib/live";

export default function CurrencyCard({ currency }: { currency: Currency }) {
  const [c, setC] = React.useState<Currency>(currency);

  // Ensure polling is active and refresh this card when data updates
  useLiveCurrencies(60_000);
  React.useEffect(() => {
    const onUpdate = () => {
      loadCurrencies().then((d) => {
        const found = d.find((x) => x.code === currency.code);
        if (found) setC(found);
      });
    };
    window.addEventListener("currencies:updated", onUpdate as EventListener);
    return () => window.removeEventListener("currencies:updated", onUpdate as EventListener);
  }, [currency.code]);

  const delta = c.score_change_30d;
  const dir = delta > 0 ? "▲" : delta < 0 ? "▼" : "→";
  const deltaClass =
    delta > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : delta < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-[var(--cr-muted)]";
  return (
    <div className="cr-card p-4 w-56">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag code={c.code} width={24} height={16} className="h-4 w-6 rounded-sm border border-black/20" />
          <div>
            <div className="font-semibold leading-tight">{c.code}</div>
            <div className="text-xs text-[var(--cr-muted)] leading-tight">{c.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingPill grade={c.grade} score={c.score} />
          <WatchlistToggle code={c.code} />
        </div>
      </div>
      <div className="mt-2 text-sm text-[var(--cr-muted)]">
        {dir} <span className={deltaClass}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</span> (30d)
      </div>
    </div>
  );
}
