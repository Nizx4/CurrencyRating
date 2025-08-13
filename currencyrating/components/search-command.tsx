"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadCurrencies } from "@/lib/data";

export default function SearchCommand() {
  const [items, setItems] = React.useState<{ code: string; name: string; country: string }[]>([]);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load currency dataset (code, name, country)
  React.useEffect(() => {
    loadCurrencies().then((data) =>
      setItems(data.map((d) => ({ code: d.code, name: d.name, country: d.country })))
    );
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K focuses the search input
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalized = query.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (!normalized) return [] as typeof items;
    return items
      .filter((i) =>
        i.name.toLowerCase().includes(normalized) || i.country.toLowerCase().includes(normalized)
      )
      .slice(0, 12);
  }, [items, normalized]);

  const onSelect = (code: string) => {
    router.push(`/currency/${code.toLowerCase()}`);
    // Optional: clear search after navigation
    setQuery("");
  };

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      onSelect(results[0].code);
    }
    if (e.key === "Escape") {
      setQuery("");
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDownInput}
        placeholder="Search currency or country…"
        aria-label="Search currency or country"
        className="w-full text-sm bg-white/5 hover:bg-white/10 border border-[var(--cr-border)] rounded-xl px-3 py-2 text-[var(--cr-foreground)] placeholder-[var(--cr-muted)] focus:outline-none"
      />
      {normalized && (
        <div
          role="listbox"
          className="absolute z-40 mt-1 w-full cr-card p-1 max-h-80 overflow-auto"
        >
          {results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-[var(--cr-muted)]">No results.</div>
          ) : (
            results.map((i) => (
              <button
                key={i.code}
                role="option"
                aria-selected={false}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-white/5"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(i.code)}
              >
                <span className="w-12 text-[var(--cr-muted)]">{i.code}</span>
                <span className="flex-1">
                  <span className="font-medium">{i.name}</span>
                  <span className="text-[var(--cr-muted)]"> — {i.country}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
