"use client";

import { Suspense } from "react";
import CurrencyTable from "@/components/currency-table";
import FilterDrawer from "@/components/filter-drawer";
import { useSearchParams } from "next/navigation";

export default function CurrenciesPage() {
  const params = useSearchParams();
  const watchlistOnly = params.get("watchlist") === "1";
  const title = watchlistOnly ? "Watchlist" : "All Currencies";
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <Suspense fallback={null}>
          <FilterDrawer />
        </Suspense>
      </div>
      <CurrencyTable title={title} watchlistOnly={watchlistOnly} />
    </div>
  );
}
