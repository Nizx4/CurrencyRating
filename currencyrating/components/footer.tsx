import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--cr-border)] mt-10 bg-[var(--cr-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-[var(--cr-muted)]">
        <nav className="flex flex-wrap gap-4 mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>·</span>
          <Link href="/currencies" className="hover:underline">All Currencies</Link>
          <span>·</span>
          <Link href="/methodology" className="hover:underline">Methodology</Link>
          <span>·</span>
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <a href="mailto:hello@currencyrating.com" className="hover:underline">Contact</a>
        </nav>
        <p className="text-xs">
          Educational information, not investment advice. Data may be delayed or estimated. © CurrencyRating.com.
        </p>
      </div>
    </footer>
  );
}
