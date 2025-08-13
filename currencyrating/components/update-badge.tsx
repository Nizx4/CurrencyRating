"use client";

import * as React from "react";
import { loadCurrencies } from "@/lib/data";
import { useLiveCurrencies } from "@/lib/live";

export default function UpdateBadge({ lastUpdated }: { lastUpdated?: string }) {
  const [last, setLast] = React.useState<string>(lastUpdated ?? "");

  // Ensure polling is active (singleton) and update when dataset changes
  useLiveCurrencies(60_000);

  // Sync with server-provided prop if it changes
  React.useEffect(() => {
    if (typeof lastUpdated === "string") setLast(lastUpdated);
  }, [lastUpdated]);

  React.useEffect(() => {
    const onUpdate = () => {
      loadCurrencies().then((d) => {
        const latest = d.map((x) => x.last_updated).sort().at(-1) ?? "";
        setLast(latest);
      });
    };
    window.addEventListener("currencies:updated", onUpdate as EventListener);
    return () => window.removeEventListener("currencies:updated", onUpdate as EventListener);
  }, []);

  return <div className="text-xs text-[var(--cr-muted)]">Last update: {last}</div>;
}
