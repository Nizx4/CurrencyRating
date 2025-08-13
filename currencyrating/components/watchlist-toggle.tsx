"use client";

import * as React from "react";
import { loadLocal, saveLocal } from "@/lib/utils";
import { Star } from "lucide-react";

export default function WatchlistToggle({ code }: { code: string }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const list = loadLocal<string[]>("cr_watchlist", []);
    setOn(list.includes(code));
  }, [code]);
  const toggle = () => {
    const list = loadLocal<string[]>("cr_watchlist", []);
    const next = on ? list.filter((c) => c !== code) : Array.from(new Set([...list, code]));
    saveLocal("cr_watchlist", next);
    setOn(!on);
    // Notify any listeners (same-tab) that the watchlist changed
    try {
      window.dispatchEvent(new CustomEvent("watchlist:changed", { detail: { code, on: !on } }));
    } catch {}
  };
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className={`cr-btn ${on ? "text-yellow-400" : "text-[var(--cr-muted)]"}`}
      aria-pressed={on}
      aria-label="Toggle watchlist"
    >
      <Star className="h-5 w-5" fill={on ? "currentColor" : "none"} />
    </button>
  );
}
