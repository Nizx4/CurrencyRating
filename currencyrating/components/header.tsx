"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Star } from "lucide-react";
import RegionChips from "./region-chips";
import SearchCommand from "./search-command";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--cr-border)] bg-[var(--cr-surface)]/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          CurrencyRating
        </Link>
        <div className="flex-1 max-w-xl mx-auto">
          <SearchCommand />
        </div>
        <div className="hidden md:block">
          <RegionChips />
        </div>
        <Link href="/currencies?watchlist=1" className="cr-btn" aria-label="Watchlist">
          <Star className="h-5 w-5" />
        </Link>
        <button onClick={toggle} className="cr-btn" aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
