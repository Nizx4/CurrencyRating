"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { loadCurrencies, type Currency } from "@/lib/data";
import CurrencyCard from "@/components/currency-card";
import DriverBreakdown from "@/components/driver-breakdown";
import TimeSeriesChart from "@/components/time-series-chart";
import { useLiveCurrencies } from "@/lib/live";

export default function ComparePage() {
  const params = useSearchParams();
  const codesStr = params.get("codes") || "";
  const codes = React.useMemo(() => codesStr.split(",").filter(Boolean).slice(0, 3), [codesStr]);
  const [items, setItems] = React.useState<Currency[]>([]);
  React.useEffect(() => {
    loadCurrencies().then((d) => setItems(d.filter((x) => codes.includes(x.code))));
  }, [codes]);

  // Keep compare data fresh as the dataset updates
  useLiveCurrencies(60_000);
  React.useEffect(() => {
    const onUpdate = () => {
      loadCurrencies().then((d) => setItems(d.filter((x) => codes.includes(x.code))));
    };
    window.addEventListener("currencies:updated", onUpdate as EventListener);
    return () => window.removeEventListener("currencies:updated", onUpdate as EventListener);
  }, [codes]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Compare</h1>
      <div className="flex gap-3 overflow-x-auto">
        {items.map((c) => (
          <CurrencyCard key={c.code} currency={c} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <DriverBreakdown key={c.code} drivers={c.drivers} />
        ))}
      </div>
      <div className="grid md:grid-cols-1 gap-4">
        {items.map((c) => (
          <TimeSeriesChart key={c.code} score={c.score} change30={c.score_change_30d} />
        ))}
      </div>
    </div>
  );
}
