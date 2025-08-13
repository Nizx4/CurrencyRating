"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Currency, loadCurrencies, filterCurrencies, toCSV } from "@/lib/data";
import RatingPill from "./rating-pill";
import Flag from "./flag";
import WatchlistToggle from "./watchlist-toggle";
import { loadLocal } from "@/lib/utils";
import EmptyState from "./empty-state";
import { useLiveCurrencies } from "@/lib/live";

function SignalsCell({ c }: { c: Currency }) {
  return (
    <div className="flex gap-1">
      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--cr-border)] text-xs">{c.signals.fundamentals}</span>
      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--cr-border)] text-xs">{c.signals.momentum}</span>
      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-[var(--cr-border)] text-xs">{c.signals.liquidity}</span>
    </div>
  );
}

export default function CurrencyTable({ title = "All Currencies", regions, watchlistOnly = false }: { title?: string; regions?: string[]; watchlistOnly?: boolean } = {}) {
  const router = useRouter();
  const [data, setData] = React.useState<Currency[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "score", desc: true }]);
  const [watchlist, setWatchlist] = React.useState<string[]>([]);
  const regionsKey = React.useMemo(() => (regions && regions.length ? regions.join("|") : ""), [regions]);

  // Start live polling for fresh currency data
  useLiveCurrencies(60_000);

  React.useEffect(() => {
    loadCurrencies().then(() => {
      const rows = regions && regions.length ? filterCurrencies({ regions }) : filterCurrencies();
      setData(rows);
    });
  }, [regionsKey, regions]);

  // Recompute rows whenever the live dataset updates
  React.useEffect(() => {
    const onUpdate = () => {
      const rows = regions && regions.length ? filterCurrencies({ regions }) : filterCurrencies();
      setData(rows);
    };
    window.addEventListener("currencies:updated", onUpdate as EventListener);
    return () => window.removeEventListener("currencies:updated", onUpdate as EventListener);
  }, [regionsKey, regions]);

  // Load watchlist and subscribe to updates
  React.useEffect(() => {
    setWatchlist(loadLocal<string[]>("cr_watchlist", []));
    const onChanged = () => setWatchlist(loadLocal<string[]>("cr_watchlist", []));
    window.addEventListener("watchlist:changed", onChanged as EventListener);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("watchlist:changed", onChanged as EventListener);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  const visibleRows = React.useMemo(() => {
    const rows = data;
    if (!watchlistOnly) return rows;
    const set = new Set(watchlist);
    return rows.filter((r) => set.has(r.code));
  }, [data, watchlistOnly, watchlist]);

  const columns = React.useMemo<ColumnDef<Currency>[]>(
    () => [
      {
        id: "watchlist-toggle",
        header: "",
        cell: ({ row }) => <WatchlistToggle code={row.original.code} />,

      },
      {
        id: "flag",
        header: "Flag",
        cell: ({ row }) => (
          <Flag code={row.original.code} width={24} height={16} className="h-4 w-6 rounded-sm border border-black/20" />
        ),
      },
      {
        header: "Currency",
        accessorKey: "name",
        cell: ({ row }) => (
          <Link
            href={`/currency/${row.original.code.toLowerCase()}`}
            aria-label={`Open ${row.original.name} (${row.original.code}) profile`}
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        header: "Code",
        accessorKey: "code",
        cell: ({ row }) => (
          <Link
            href={`/currency/${row.original.code.toLowerCase()}`}
            aria-label={`Open ${row.original.name} (${row.original.code}) profile`}
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {row.original.code}
          </Link>
        ),
      },
      {
        header: "Grade",
        accessorKey: "grade",
        cell: ({ row }) => <RatingPill grade={row.original.grade} score={row.original.score} />,
      },
      { header: "Score", accessorKey: "score" },
      {
        header: "1m Δ",
        accessorKey: "score_change_30d",
        cell: ({ row }) => {
          const delta = row.original.score_change_30d;
          const dir = delta > 0 ? "▲" : delta < 0 ? "▼" : "→";
          const deltaClass =
            delta > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : delta < 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-[var(--cr-muted)]";
          return (
            <span>
              {dir} <span className={deltaClass}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</span>
            </span>
          );
        },
      },
      {
        header: "3m Δ",
        accessorKey: "score_change_90d",
        cell: ({ row }) => {
          const delta = row.original.score_change_90d;
          const dir = delta > 0 ? "▲" : delta < 0 ? "▼" : "→";
          const deltaClass =
            delta > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : delta < 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-[var(--cr-muted)]";
          return (
            <span>
              {dir} <span className={deltaClass}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</span>
            </span>
          );
        },
      },
      {
        id: "signals",
        header: "Signals",
        cell: ({ row }) => <SignalsCell c={row.original} />,

      },
    ],
    []
  );

  const table = useReactTable({ data: visibleRows, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  const onExport = () => {
    const csv = toCSV(visibleRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "currencies.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (e.key === "Enter") {
      const row = table.getRowModel().rows[0];
      if (row) router.push(`/currency/${row.original.code.toLowerCase()}`);
    }
  };

  return (
    <div className="cr-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--cr-border)]">
        <div className="font-semibold">{title}</div>
        <button className="cr-btn text-sm" onClick={onExport}>Export CSV</button>
      </div>
      <div className="overflow-auto">
        {visibleRows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={watchlistOnly ? "No bookmarked currencies" : "No results"}
              subtitle={watchlistOnly ? "Click the star on any currency to add it to your watchlist." : undefined}
            />
          </div>
        ) : null}
        <table className="w-full text-sm" onKeyDown={onKeyDown}>
          <caption className="sr-only">Sortable table of currency ratings, codes, grades, scores, and signals</caption>
          <thead className="sticky top-0 bg-[var(--cr-surface)]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left">
                {hg.headers.map((h) => {
                  const sortState = h.column.getIsSorted() as string | false;
                  const ariaSort = sortState === "asc" ? "ascending" : sortState === "desc" ? "descending" : "none";
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={ariaSort as "none" | "ascending" | "descending"}
                      className="px-3 py-2 border-b border-[var(--cr-border)]"
                    >
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[sortState as string] ?? null}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-white/5 cursor-pointer"
                onClick={() => router.push(`/currency/${row.original.code.toLowerCase()}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 border-b border-[var(--cr-border)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
